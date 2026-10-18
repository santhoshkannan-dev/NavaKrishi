from decimal import Decimal
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

# ensure test hosts allowed
settings.ALLOWED_HOSTS = list(set(list(getattr(settings, 'ALLOWED_HOSTS', [])) + ['testserver', 'localhost', '127.0.0.1']))

PROMOS = [
    'WELCOME10',
    'FARMFRESH',
    'GREENFUTURE',
    'DIRECTFARM',
    'PRITHVIAI',
    'HARVEST25',
    'FREESHIP',
    'SOILHEALTH',
]

from core.models import Product, Cart, CartItem, PromoCode, Order
from core.views import _build_order_from_cart

for code in PROMOS:
    print('\n==== Testing', code, '====')
    username = f'promo_tester_{code.lower()}'
    password = 'promotest123'
    user, created = User.objects.get_or_create(username=username, defaults={'email': f'{username}@test.local'})
    if created:
        user.set_password(password)
        user.save()
        print('Created user', username)
    else:
        print('Using existing user', username)

    # create product owned by system (use superuser or user)
    owner = user
    product, _ = Product.objects.get_or_create(title=f'Promo Product {code}', defaults={'farmer_id': owner.id, 'price': Decimal('1200.00'), 'quantity_available': 100})

    # prepare cart
    cart, _ = Cart.objects.get_or_create(user=user)
    cart.items.all().delete()
    CartItem.objects.create(cart=cart, product=product, quantity=1)
    # compute subtotal as Cart may not expose a subtotal property
    subtotal = sum((ci.product.price * ci.quantity) for ci in cart.items.all())
    print('Cart subtotal:', subtotal)

    client = APIClient()
    client.force_authenticate(user=user)

    print('\n-- Apply', code, '(attempt 1) --')
    resp = client.post('/api/promocodes/apply/', {'code': code}, format='json')
    print('Status:', resp.status_code)
    try:
        print('Data:', resp.data)
        discount_amount = resp.data.get('discount_amount') or Decimal('0')
    except Exception:
        print('Content:', resp.content)
        discount_amount = Decimal('0')

    print('\n-- Create order to consume promo --')
    try:
        order = _build_order_from_cart(
            user=user,
            payment_order_id=f'{code}_ORDER_1',
            payment_id=f'{code}_PAY_1',
            payment_signature='',
            shipping_address={},
            customer_name=user.get_full_name() or user.username,
            customer_email=user.email or '',
            customer_phone=getattr(user, 'phone', '') or '',
            promo_code=code if resp.status_code == 200 else None,
            discount_amount=Decimal(str(discount_amount)) if discount_amount else Decimal('0'),
        )
        print('Order created:', order.id, order.order_number, 'total:', order.total_amount)
        # increment promo usage (some promos require it)
        promo = PromoCode.objects.filter(code__iexact=code).first()
        if promo:
            promo.times_used = (promo.times_used or 0) + 1
            promo.save()
            print('Incremented', code, 'times_used ->', promo.times_used)
    except Exception as e:
        print('Order creation failed:', e)

    # clear cart
    cart.items.all().delete()

    print('\n-- Apply', code, '(attempt 2) --')
    resp2 = client.post('/api/promocodes/apply/', {'code': code}, format='json')
    print('Status:', resp2.status_code)
    try:
        print('Data:', resp2.data)
    except Exception:
        print('Content:', resp2.content)

print('\nAll promos processed')
