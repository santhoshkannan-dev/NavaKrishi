from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal

User = get_user_model()


class FarmerAnalyticsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.farmer = User.objects.create(username='analytics_farmer')
        self.farmer.role = 'farmer'
        self.farmer.save()

    def test_farmer_analytics_requires_farmer(self):
        # unauthenticated
        resp = self.client.get('/api/orders/farmer-analytics/')
        self.assertEqual(resp.status_code, 401)

    def test_farmer_analytics_ok(self):
        self.client.force_authenticate(user=self.farmer)
        resp = self.client.get('/api/orders/farmer-analytics/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('aggregates', data)
        self.assertIn('monthly', data)
        self.assertIn('categories', data)
