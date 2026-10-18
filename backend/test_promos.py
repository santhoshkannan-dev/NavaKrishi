from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


def main():
    User = get_user_model()
    username = 'promo_tester'
    password = 'testpass123'
    user, created = User.objects.get_or_create(username=username, defaults={'email': 'promo@test.local'})
    if created:
        user.set_password(password)
        user.save()
        print('Created test user')
    else:
        print('Using existing test user')

    from core.models import Cart, CartItem, Order, Product
    product, _ = Product.objects.get_or_create(
        title='Promo Test Product',
        defaults={'farmer_id': user.id, 'price': Decimal('1200.00'), 'quantity_available': 100},
    )
    print('Product:', product.id, product.title, product.price)

    cart, _ = Cart.objects.get_or_create(user=user)
    if not cart.items.exists():
        CartItem.objects.create(cart=cart, product=product, quantity=1)
        print('Added product to cart')
    else:
        print('Cart already has items')

    client = APIClient()
    client.force_authenticate(user=user)
    settings.ALLOWED_HOSTS = list(set(list(getattr(settings, 'ALLOWED_HOSTS', [])) + ['testserver', 'localhost', '127.0.0.1']))

    for code in ('FREESHIP', 'WELCOME10'):
        print(f'\n--- Applying {code} ---')
        response = client.post('/api/promocodes/apply/', {'code': code}, format='json')
        print('Status:', response.status_code)
        print('Data:', getattr(response, 'data', response.content.decode('utf-8')))

    print('\n--- Creating a dummy order to simulate prior purchase ---')
    order = Order.objects.create(
        user=user,
        payment_order_id='TESTORD1',
        payment_id='TESTPAY1',
        payment_signature='',
        payment_method='razorpay',
        payment_status='paid',
        payment_gateway='TEST',
        subtotal=Decimal('1200.00'),
        tax_amount=Decimal('60.00'),
        delivery_fee=Decimal('50.00'),
        total_amount=Decimal('1310.00'),
    )
    print('Created order', order.id)

    print('\n--- Applying WELCOME10 (after an order) ---')
    response = client.post('/api/promocodes/apply/', {'code': 'WELCOME10'}, format='json')
    print('Status:', response.status_code)
    print('Data:', getattr(response, 'data', response.content.decode('utf-8')))
    print('\nDone')


if __name__ == '__main__':
    main()
