from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
import base64
import json
import urllib.request
import urllib.error
import logging

from core.models import Subscription
from core.serializers import SubscriptionSerializer

logger = logging.getLogger(__name__)

NOTIFY_DAYS = int(getattr(settings, 'SUBSCRIPTION_NOTIFY_DAYS', 7))


class Command(BaseCommand):
    help = 'Notify about upcoming subscription expiries and auto-renew subscriptions that opted in.'

    def handle(self, *args, **options):
        now = timezone.now()
        notify_before = now + timezone.timedelta(days=NOTIFY_DAYS)

        # Notify users whose subscriptions end within notify window and haven't been notified
        to_notify = Subscription.objects.filter(end_date__gt=now, end_date__lte=notify_before, renewal_notified_at__isnull=True)
        for sub in to_notify:
            try:
                # Create in-app notification
                from core.models import Notification
                Notification.objects.create(
                    user=sub.user,
                    notification_type='system',
                    title='Subscription expiring soon',
                    message=f'Your subscription to {sub.plan.name if sub.plan else "the plan"} will expire on {sub.end_date}.',
                )
                # Send email if configured
                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None)
                if from_email and getattr(sub.user, 'email', ''):
                    subject = f'Your subscription to {sub.plan.name if sub.plan else "NavaKrishi"} is expiring'
                    body = f'Hello {sub.user.get_full_name() or sub.user.username},\n\nYour subscription will expire on {sub.end_date}. If you have auto-renew enabled, we will attempt to renew it. Otherwise please renew manually from your account.\n\nThanks,\nNavaKrishi'
                    send_mail(subject, body, from_email, [sub.user.email], fail_silently=True)
                sub.renewal_notified_at = now
                sub.save(update_fields=['renewal_notified_at', 'updated_at'])
            except Exception:
                logger.exception('Failed to notify for subscription %s', sub.id)

        # Auto-renew subscriptions where end_date <= now and auto_renew=True
        to_renew = Subscription.objects.filter(end_date__lte=now, auto_renew=True)
        key_id = None
        key_secret = None
        try:
            # Lazy import of helper to fetch credentials
            from core.views import _get_razorpay_credentials, _create_razorpay_plan_if_needed, _create_razorpay_customer_if_needed, _plan_duration_months
            key_id, key_secret = _get_razorpay_credentials()
        except Exception:
            logger.exception('Failed to import razorpay helpers')

        for sub in to_renew:
            try:
                # For simulated subscriptions (local) just create a new simulated subscription
                if sub.razorpay_subscription_id and str(sub.razorpay_subscription_id).startswith('sub_fake_'):
                    months = _plan_duration_months(sub.plan) if sub.plan else 1
                    start = now
                    end = start + timezone.timedelta(days=30 * months)
                    with transaction.atomic():
                        sub.status = 'completed'
                        sub.save(update_fields=['status', 'updated_at'])
                        new_sub = Subscription.objects.create(
                            user=sub.user,
                            plan=sub.plan,
                            razorpay_subscription_id=f'sub_fake_{sub.user.id}_{sub.plan.id}_{int(start.timestamp())}',
                            status='active',
                            current_start=start,
                            current_end=end,
                            start_date=start,
                            end_date=end,
                        )
                        # notify user
                        from core.models import Notification
                        Notification.objects.create(
                            user=new_sub.user,
                            notification_type='system',
                            title='Subscription renewed',
                            message=f'Your subscription to {new_sub.plan.name if new_sub.plan else "the plan"} has been renewed and is active until {new_sub.end_date}.',
                        )
                else:
                    # Attempt to create a new subscription via Razorpay for real subscriptions
                    if not key_id or not key_secret:
                        logger.warning('Razorpay credentials not available; skipping auto-renew for %s', sub.id)
                        continue
                    plan = sub.plan
                    # Ensure plan exists on Razorpay
                    razorpay_plan_id = _create_razorpay_plan_if_needed(plan, key_id, key_secret)
                    if not razorpay_plan_id:
                        logger.warning('Failed to ensure razorpay plan for %s', plan.id if plan else None)
                        continue
                    # Ensure customer exists
                    customer_id = _create_razorpay_customer_if_needed(sub.user, key_id, key_secret)
                    if not customer_id:
                        logger.warning('Failed to ensure razorpay customer for user %s', sub.user.id)
                        continue
                    payload = json.dumps({
                        'plan_id': razorpay_plan_id,
                        'customer_notify': 1,
                        'total_count': 12 if plan and plan.interval == 'monthly' else 1,
                        'customer_id': customer_id,
                    }).encode('utf-8')
                    credentials = base64.b64encode(f'{key_id}:{key_secret}'.encode('utf-8')).decode('ascii')
                    req = urllib.request.Request(
                        'https://api.razorpay.com/v1/subscriptions',
                        data=payload,
                        headers={
                            'Authorization': f'Basic {credentials}',
                            'Content-Type': 'application/json',
                        },
                        method='POST'
                    )
                    try:
                        with urllib.request.urlopen(req, timeout=20) as resp:
                            data = json.loads(resp.read().decode('utf-8'))
                    except urllib.error.HTTPError as error:
                        try:
                            body = error.read().decode('utf-8')
                        except Exception:
                            body = '<unreadable body>'
                        logger.exception('HTTPError from Razorpay when auto-renewing subscription: %s', body)
                        # leave for retry next run
                        continue
                    except Exception:
                        logger.exception('Error contacting Razorpay during auto-renew')
                        continue

                    # persist new subscription record
                    razorpay_sub_id = data.get('id')
                    sub_status = data.get('status')
                    with transaction.atomic():
                        sub.status = 'completed'
                        sub.save(update_fields=['status', 'updated_at'])
                        new_sub = Subscription.objects.create(
                            user=sub.user,
                            plan=plan,
                            razorpay_subscription_id=razorpay_sub_id,
                            status=sub_status or 'created'
                        )
                        try:
                            if data.get('current_start'):
                                new_sub.current_start = timezone.datetime.fromtimestamp(int(data.get('current_start')), tz=timezone.utc)
                                new_sub.start_date = new_sub.current_start
                            else:
                                new_sub.start_date = now
                            if data.get('current_end'):
                                new_sub.current_end = timezone.datetime.fromtimestamp(int(data.get('current_end')), tz=timezone.utc)
                                new_sub.end_date = new_sub.current_end
                            else:
                                months = _plan_duration_months(plan)
                                new_sub.end_date = now + timezone.timedelta(days=30 * months) if months > 0 else None
                            new_sub.save(update_fields=['current_start', 'current_end', 'start_date', 'end_date', 'updated_at'])
                        except Exception:
                            pass
                        # notify
                        from core.models import Notification
                        Notification.objects.create(
                            user=new_sub.user,
                            notification_type='system',
                            title='Subscription renewed',
                            message=f'Your subscription to {new_sub.plan.name if new_sub.plan else "the plan"} has been renewed and is active until {new_sub.end_date}.',
                        )

            except Exception:
                logger.exception('Failed to auto-renew subscription %s', sub.id)

        self.stdout.write(self.style.SUCCESS('renew_subscriptions run finished'))
