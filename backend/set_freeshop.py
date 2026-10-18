from decimal import Decimal

from django.utils import timezone
from core.models import PromoCode

promo = PromoCode.objects.filter(code__iexact='FREESHIP').first()
if promo:
    promo.discount_type = 'shipping'
    promo.value = Decimal('50.00')
    promo.save()
    print('Updated FREESHIP to shipping promo with value 50')
else:
    print('FREESHIP not found')
