from decimal import Decimal
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

# allow testserver host
settings.ALLOWED_HOSTS = list(set(list(getattr(settings, 'ALLOWED_HOSTS', [])) + ['testserver', 'localhost', '127.0.0.1']))

username = 'welcome_tester'
password = 'welcome123'
user, created = User.objects.get_or_create(username=username, defaults={'email': 'welcome@test.local'})
if created:
    user.set_password(password)
    user.save()
    print('Created test user:', username)
else:
    print('Using existing user:', username)

from core.models import Product, Cart, CartItem, PromoCode, Order
from core.views import _build_order_from_cart

# ensure product and cart
product, _ = Product.objects.get_or_create(title='Welcome Product', defaults={'farmer_id': user.id, 'price': Decimal('800.00'), 'quantity_available': 100})
cart, _ = Cart.objects.get_or_create(user=user)
if not cart.items.exists():
    CartItem.objects.create(cart=cart, product=product, quantity=1)
    print('Added product to cart')

client = APIClient()
client.force_authenticate(user=user)

print('\n-- Apply WELCOME10 (first attempt) --')
resp = client.post('/api/promocodes/apply/', {'code': 'WELCOME10'}, format='json')
print('Status:', resp.status_code)
try:
    print('Data:', resp.data)
    discount_amount = resp.data.get('discount_amount') or Decimal('0')
    free_shipping = resp.data.get('free_shipping', False)
except Exception:
    print('Content:', resp.content)
    discount_amount = Decimal('0')
    free_shipping = False

print('\n-- Create order to consume promo --')
order = _build_order_from_cart(
    user=user,
    payment_order_id='WEL_ORDER_1',
    payment_id='WEL_PAY_1',
    payment_signature='',
    shipping_address={},
    customer_name=user.get_full_name() or user.username,
    customer_email=user.email or '',
    customer_phone=getattr(user, 'phone', '') or '',
    promo_code='WELCOME10',
    discount_amount=Decimal(str(discount_amount)) if discount_amount else Decimal('0'),
)
print('Order created:', order.id, order.order_number)

# increment usage
promo = PromoCode.objects.filter(code__iexact='WELCOME10').first()
if promo:
    promo.times_used = (promo.times_used or 0) + 1
    promo.save()
    print('Incremented WELCOME10.times_used ->', promo.times_used)

# clear cart
cart.items.all().delete()

print('\n-- Apply WELCOME10 (after order) --')
resp2 = client.post('/api/promocodes/apply/', {'code': 'WELCOME10'}, format='json')
print('Status:', resp2.status_code)
try:
    print('Data:', resp2.data)
except Exception:
    print('Content:', resp2.content)

print('\nDone')
