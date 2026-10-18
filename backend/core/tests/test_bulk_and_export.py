from django.test import TestCase
from django.urls import reverse
from accounts.models import User
from core.models import Product, Order, OrderItem, Category


class BulkAndExportTests(TestCase):
    def setUp(self):
        self.farmer = User.objects.create_user(username='farmerx', password='pass', role='farmer')
        self.customer = User.objects.create_user(username='custx', password='pass', role='customer')
        cat = Category.objects.create(name='Veg')
        self.product = Product.objects.create(title='Potato', farmer=self.farmer, category=cat, price=5, quantity_available=100)

        # create two orders
        self.order1 = Order.objects.create(user=self.customer, payment_status='paid', subtotal=5, tax_amount=0, delivery_fee=0, total_amount=5)
        OrderItem.objects.create(order=self.order1, product=self.product, product_title=self.product.title, product_unit='kg', farmer_name=self.farmer.username, unit_price=5, quantity=1, total_price=5)

        self.order2 = Order.objects.create(user=self.customer, payment_status='paid', subtotal=10, tax_amount=0, delivery_fee=0, total_amount=10)
        OrderItem.objects.create(order=self.order2, product=self.product, product_title=self.product.title, product_unit='kg', farmer_name=self.farmer.username, unit_price=5, quantity=2, total_price=10)

    def test_bulk_mark_shipped_and_export(self):
        self.client.login(username='farmerx', password='pass')
        url = reverse('bulk-mark-shipped')
        # bulk mark
        resp = self.client.post('/api/orders/bulk-mark-shipped/', {'order_ids': [self.order1.id, self.order2.id]}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data.get('changed'), 3)

        # export selected
        resp2 = self.client.get(f'/api/orders/farmer-orders/export/?order_ids={self.order1.id},{self.order2.id}')
        self.assertEqual(resp2.status_code, 200)
        content = resp2.content.decode('utf-8')
        # header present
        self.assertIn('order_number', content)
        # should have lines for two orders' items (3 items)
        lines = [l for l in content.splitlines() if l.strip()]
        self.assertGreaterEqual(len(lines), 4)
