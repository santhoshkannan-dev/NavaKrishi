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


class PredictionLabAPITests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.farmer = User.objects.create_user(username='prediction-farmer', password='pass', role='farmer')
		self.other_farmer = User.objects.create_user(username='other-farmer', password='pass', role='farmer')
		self.client.force_authenticate(user=self.farmer)
		self.scenario = {
			'season': 'summer',
			'expected_rainfall': 650,
			'min_temperature': 22,
			'max_temperature': 34,
			'soil_ph': 6.5,
		}

	def test_requires_authentication(self):
		self.client.force_authenticate(user=None)
		response = self.client.post('/api/farmer/prediction-lab/analyze/', self.scenario, format='json')
		self.assertEqual(response.status_code, 401)

	def test_analyze_validates_temperature_and_returns_transparent_result(self):
		invalid = {**self.scenario, 'min_temperature': 40, 'max_temperature': 20}
		response = self.client.post('/api/farmer/prediction-lab/analyze/', invalid, format='json')
		self.assertEqual(response.status_code, 400)

		response = self.client.post('/api/farmer/prediction-lab/analyze/', self.scenario, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data['recommendations']), 3)
		self.assertFalse(response.data['accuracy']['available'])
		self.assertFalse(response.data['revenue']['available'])

	def test_save_history_and_ownership_isolation(self):
		response = self.client.post('/api/farmer/prediction-lab/simulations/', {**self.scenario, 'scenario_name': 'Summer plan'}, format='json')
		self.assertEqual(response.status_code, 201)
		simulation_id = response.data['id']
		self.assertEqual(self.client.get('/api/farmer/prediction-lab/simulations/').data[0]['id'], simulation_id)

		self.client.force_authenticate(user=self.other_farmer)
		history = self.client.get('/api/farmer/prediction-lab/simulations/')
		self.assertEqual(history.status_code, 200)
		self.assertEqual(history.data, [])
		compare = self.client.post('/api/farmer/prediction-lab/compare/', {'current_id': simulation_id, 'previous_id': simulation_id}, format='json')
		self.assertEqual(compare.status_code, 404)

	def test_compare_owned_simulations(self):
		first = self.client.post('/api/farmer/prediction-lab/simulations/', {**self.scenario, 'scenario_name': 'First'}, format='json').data
		second = self.client.post('/api/farmer/prediction-lab/simulations/', {**self.scenario, 'season': 'winter', 'scenario_name': 'Second'}, format='json').data
		response = self.client.post('/api/farmer/prediction-lab/compare/', {'current_id': second['id'], 'previous_id': first['id']}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertIn('top_crop_changed', response.data['changes'])
