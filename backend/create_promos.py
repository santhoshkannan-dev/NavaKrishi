import os
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()

from django.utils import timezone

promos = [
    {
        'code': 'WELCOME10',
        'discount_type': 'percent',
        'value': Decimal('10'),
        'active': True,
        'expires_at': None,
        'usage_limit': None,
        'min_order_amount': Decimal('0'),
    },
    {
        'code': 'FARMFRESH',
        'discount_type': 'percent',
        'value': Decimal('15'),
        'active': True,
        'expires_at': None,
        'usage_limit': None,
        'min_order_amount': Decimal('0'),
    },
    {
        'code': 'GREENFUTURE',
        'discount_type': 'percent',
        'value': Decimal('20'),
        'active': True,
        'expires_at': None,
        'usage_limit': None,
        'min_order_amount': Decimal('0'),
    },
    {
        'code': 'DIRECTFARM',
        'discount_type': 'percent',
        'value': Decimal('12'),
        'active': True,
        'expires_at': None,
        'usage_limit': None,
        'min_order_amount': Decimal('0'),
    },
    {
        'code': 'PRITHVIAI',
        'discount_type': 'percent',
        'value': Decimal('18'),
        'active': True,
        'expires_at': None,
        'usage_limit': None,
        'min_order_amount': Decimal('0'),
    },
    {
        'code': 'HARVEST25',
        'discount_type': 'percent',
        'value': Decimal('25'),
        'active': True,
        'expires_at': None,
        'usage_limit': None,
        'min_order_amount': Decimal('0'),
    },
    {
        'code': 'FREESHIP',
        'discount_type': 'shipping',
        'value': Decimal('50.00'),
        'active': True,
        'expires_at': None,
        'usage_limit': None,
        'min_order_amount': Decimal('0'),
    },
    {
        'code': 'SOILHEALTH',
        'discount_type': 'fixed',
        'value': Decimal('500'),
        'active': True,
        'expires_at': None,
        'usage_limit': None,
        'min_order_amount': Decimal('3000'),
    },
]

from core.models import PromoCode

for p in promos:
    obj, created = PromoCode.objects.update_or_create(
        code=p['code'],
        defaults={
            'discount_type': p['discount_type'],
            'value': p['value'],
            'active': p['active'],
            'expires_at': p['expires_at'],
            'usage_limit': p['usage_limit'],
            'min_order_amount': p['min_order_amount'],
        }
    )
    print(('Created' if created else 'Updated') + ' promo:', obj.code)

print('Done')
