from django.contrib.auth import get_user_model
from core.models import Subscription, SubscriptionPlan
import uuid

User = get_user_model()
user = User.objects.filter(username='santhoshkannan').first()
plan = SubscriptionPlan.objects.filter(name__icontains='Pro').first()
print('found_user', bool(user), 'plan_id', plan.id if plan else None)
if user and plan:
    razor_id = 'local-pro-' + uuid.uuid4().hex[:8]
    sub = Subscription.objects.create(user=user, plan=plan, razorpay_subscription_id=razor_id, status='created')
    print('created', sub.id, sub.status, sub.plan.name)
else:
    print('could not create subscription; missing user or plan')
