from django.test import TestCase
from django.urls import reverse
from accounts.models import User
from core.models import Product, Order, OrderItem, Category


class FarmerOrdersAPITest(TestCase):
    def setUp(self):
        # create farmer and customer
        self.farmer = User.objects.create_user(username='farmer1', password='pass', role='farmer')
        self.customer = User.objects.create_user(username='cust1', password='pass', role='customer')

        cat = Category.objects.create(name='Veg')
        self.product = Product.objects.create(title='Tomato', farmer=self.farmer, category=cat, price=10, quantity_available=100)

        # create order from customer
        self.order = Order.objects.create(user=self.customer, payment_order_id='p1', payment_id='p1id', payment_signature='', payment_method='razorpay', payment_status='paid', payment_gateway='Razorpay', subtotal=10, tax_amount=0, delivery_fee=0, total_amount=10)
        OrderItem.objects.create(order=self.order, product=self.product, product_title=self.product.title, product_image=self.product.image or '', product_unit=self.product.unit, farmer_name=self.farmer.username, unit_price=self.product.price, quantity=1, total_price=10)

    def test_farmer_orders_requires_farmer(self):
        self.client.login(username='cust1', password='pass')
        url = reverse('order-farmer-orders')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 403)

    def test_farmer_sees_order(self):
        self.client.login(username='farmer1', password='pass')
        url = reverse('order-farmer-orders')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # results should contain at least one order
        self.assertIn('results', data)
        self.assertTrue(len(data['results']) >= 1)
