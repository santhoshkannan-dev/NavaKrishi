import os
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()

from core.models import PromoCode

promo = PromoCode.objects.filter(code__iexact='FREESHIP').first()
if not promo:
    promo = PromoCode.objects.create(code='FREESHIP', discount_type='shipping', value=Decimal('50.00'), active=True)
    print('Created FREESHIP')
else:
    promo.discount_type = 'shipping'
    promo.value = Decimal('50.00')
    promo.active = True
    promo.save()
    print('Updated FREESHIP: shipping 50')

print('FREESHIP:', promo.code, promo.discount_type, promo.value, promo.active)
