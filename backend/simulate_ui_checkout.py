from decimal import Decimal
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

# ensure ALLOWED_HOSTS
settings.ALLOWED_HOSTS = list(set(list(getattr(settings, 'ALLOWED_HOSTS', [])) + ['testserver', 'localhost', '127.0.0.1']))

username = 'promo_tester'
user = User.objects.filter(username=username).first()
if not user:
    raise SystemExit('Test user not found; run test_promos.py first')

from core.models import Cart, CartItem, Product, PromoCode, Order
from core.views import _build_order_from_cart

cart, _ = Cart.objects.get_or_create(user=user)
if not cart.items.exists():
    # create a product if missing
    prod, _ = Product.objects.get_or_create(title='Sim Product', defaults={'farmer_id': user.id, 'price': Decimal('1200.00'), 'quantity_available': 100})
    CartItem.objects.create(cart=cart, product=prod, quantity=1)

client = APIClient()
client.force_authenticate(user=user)

print('Cart total:', cart.get_total_price())

# Apply FREESHIP
resp = client.post('/api/promocodes/apply/', {'code': 'FREESHIP'}, format='json')
print('Apply FREESHIP status:', resp.status_code)
try:
    print('Apply FREESHIP data:', resp.data)
    discount_amount = resp.data.get('discount_amount') or Decimal('0.00')
    free_shipping = resp.data.get('free_shipping', False)
except Exception:
    print('Response content:', resp.content)
    discount_amount = Decimal('0.00')
    free_shipping = False

# Build order server-side to simulate successful payment
order = _build_order_from_cart(
    user=user,
    payment_order_id='SIM_ORDER_1',
    payment_id='SIM_PAY_1',
    payment_signature='',
    shipping_address={},
    customer_name=user.get_full_name() or user.username,
    customer_email=user.email or '',
    customer_phone=getattr(user, 'phone', '') or '',
    promo_code='FREESHIP' if free_shipping else '',
    discount_amount=Decimal(str(discount_amount)) if discount_amount else Decimal('0.00'),
)

# increment times_used
if order.applied_promo_code:
    promo_obj = PromoCode.objects.filter(code__iexact=order.applied_promo_code).first()
    if promo_obj:
        promo_obj.times_used = (promo_obj.times_used or 0) + 1
        promo_obj.save()

# clear cart
cart.items.all().delete()

print('Created order:', order.id, order.order_number)
print('Applied promo:', order.applied_promo_code, 'Discount:', order.discount_amount)
print('Subtotal:', order.subtotal, 'Tax:', order.tax_amount, 'Delivery fee:', order.delivery_fee, 'Total:', order.total_amount)
