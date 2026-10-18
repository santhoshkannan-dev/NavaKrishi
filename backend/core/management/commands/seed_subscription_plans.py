from django.core.management.base import BaseCommand
from core.models import SubscriptionPlan


class Command(BaseCommand):
    help = 'Seed default subscription plans'

    def handle(self, *args, **options):
        plans = [
            {
                'name': 'Basic',
                'description': 'Entry level plan for casual sellers.',
                'amount': '199.00',
                'currency': 'INR',
                'interval': 'monthly',
                'features': ['List up to 50 products', 'Basic analytics'],
                'recommended': False,
                'active': True,
            },
            {
                'name': 'Pro',
                'description': 'Popular plan for growing farms.',
                'amount': '499.00',
                'currency': 'INR',
                'interval': 'monthly',
                'features': ['List up to 500 products', 'Advanced analytics', 'Priority support'],
                'recommended': True,
                'active': True,
            },
            {
                'name': 'Premium',
                'description': 'For marketplaces and enterprise growers.',
                'amount': '1999.00',
                'currency': 'INR',
                'interval': 'yearly',
                'features': ['Unlimited listings', 'Dedicated account manager', 'Custom integrations'],
                'recommended': False,
                'active': True,
            },
        ]

        for p in plans:
            obj, created = SubscriptionPlan.objects.update_or_create(
                name=p['name'],
                defaults={
                    'description': p['description'],
                    'amount': p['amount'],
                    'currency': p['currency'],
                    'interval': p['interval'],
                    'features': p['features'],
                    'recommended': p['recommended'],
                    'active': p['active'],
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created plan: {obj.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Updated plan: {obj.name}"))

        self.stdout.write(self.style.SUCCESS('Seeding subscription plans complete.'))
