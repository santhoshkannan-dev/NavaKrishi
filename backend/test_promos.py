from decimal import Decimal
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.conf import settings

User = get_user_model()

# Ensure test user exists
username = 'promo_tester'
password = 'testpass123'
user, created = User.objects.get_or_create(username=username, defaults={'email': 'promo@test.local'})
if created:
    user.set_password(password)
    user.save()
    print('Created test user')
else:
    print('Using existing test user')

# Create or get a product
from core.models import Product, PromoCode, Cart, CartItem, Order
product, _ = Product.objects.get_or_create(title='Promo Test Product', defaults={'farmer_id': user.id, 'price': Decimal('1200.00'), 'quantity_available': 100})
print('Product:', product.id, product.title, product.price)

# Ensure cart and item
cart, _ = Cart.objects.get_or_create(user=user)
if not cart.items.exists():
    CartItem.objects.create(cart=cart, product=product, quantity=1)
    print('Added product to cart')
else:
    print('Cart already has items')

client = APIClient()
client.force_authenticate(user=user)
# Ensure testserver is allowed (APIClient uses 'testserver' host)
settings.ALLOWED_HOSTS = list(set(list(getattr(settings, 'ALLOWED_HOSTS', [])) + ['testserver', 'localhost', '127.0.0.1']))

print('\n--- Applying FREESHIP ---')
resp = client.post('/api/promocodes/apply/', {'code': 'FREESHIP'}, format='json')
print('Status:', resp.status_code)
try:
    print('Data:', resp.data)
except Exception:
    print('Content:', resp.content.decode('utf-8'))

print('\n--- Applying WELCOME10 (before any orders) ---')
resp2 = client.post('/api/promocodes/apply/', {'code': 'WELCOME10'}, format='json')
print('Status:', resp2.status_code)
try:
    print('Data:', resp2.data)
except Exception:
    print('Content:', resp2.content.decode('utf-8'))

print('\n--- Creating a dummy order to simulate prior purchase ---')
# Create a simple order to mark that user has an order
ord = Order.objects.create(user=user, payment_order_id='TESTORD1', payment_id='TESTPAY1', payment_signature='', payment_method='razorpay', payment_status='paid', payment_gateway='TEST', subtotal=Decimal('1200.00'), tax_amount=Decimal('60.00'), delivery_fee=Decimal('50.00'), total_amount=Decimal('1310.00'))
print('Created order', ord.id)

print('\n--- Applying WELCOME10 (after an order) ---')
resp3 = client.post('/api/promocodes/apply/', {'code': 'WELCOME10'}, format='json')
print('Status:', resp3.status_code)
try:
    print('Data:', resp3.data)
except Exception:
    print('Content:', resp3.content.decode('utf-8'))

print('\nDone')
