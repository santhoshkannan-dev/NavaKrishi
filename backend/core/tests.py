from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from core.models import Category, Product


User = get_user_model()


class AgriAssistantAPITests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.farmer = User.objects.create_user(username="farmer-ai", password="pass", role="farmer")
		category = Category.objects.create(name="Vegetables")
		Product.objects.create(
			title="Tomato",
			farmer=self.farmer,
			category=category,
			description="Fresh tomato harvested from open field farms",
			price=12,
			quantity_available=100,
		)

	def test_chat_detects_disease_query(self):
		response = self.client.post(
			"/api/chat/",
			{"message": "My tomato leaves are turning yellow."},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data["intent"]["slug"], "disease_query")
		self.assertEqual(data["entities"]["crop"], "Tomato")
		self.assertTrue(data["possible_causes"])
		self.assertTrue(data["recommended_actions"])

	def test_search_returns_products(self):
		response = self.client.post(
			"/api/assistant/search/",
			{"query": "vegetables good for tomatoes"},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertGreaterEqual(data["count"], 1)
		self.assertEqual(data["results"][0]["title"], "Tomato")

	def test_description_generator(self):
		response = self.client.post(
			"/api/assistant/product-description/",
			{
				"title": "Organic Tomato",
				"category": "Fresh Vegetables",
				"tone": "premium",
				"highlights": "Fresh, pesticide-free, handpicked",
			},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertIn("Organic Tomato", data["generated_description"])
		self.assertTrue(data["keywords"])
