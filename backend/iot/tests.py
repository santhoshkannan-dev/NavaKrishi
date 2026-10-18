from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import SensorData, Notification, Alert


class NotificationAndAlertTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_soil_state_machine_and_anti_spam(self):
        # 1. Soil < 30% (Critical)
        p1 = {"soil_moisture": 24, "temperature": 28.0, "humidity": 60.0, "is_raining": False}
        res1 = self.client.post('/api/iot/data/', p1, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res1.data['notifications_generated'], 1)

        notif = Notification.objects.filter(notification_type='soil').first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.level, 'critical')
        self.assertIn('very low', notif.title.lower())

        # 2. NodeMCU sends continuous readings every 5 seconds (25%, 24%, 25%) -> MUST NOT SPAM!
        for m in [25, 24, 25, 23, 24]:
            p = {"soil_moisture": m, "temperature": 28.0, "humidity": 60.0, "is_raining": False}
            res = self.client.post('/api/iot/data/', p, format='json')
            self.assertEqual(res.data['notifications_generated'], 0)

        # Count must remain exactly 1
        self.assertEqual(Notification.objects.filter(notification_type='soil').count(), 1)

        # 3. Soil recovers to 55% -> triggers 🟢 "Soil moisture returned to normal"
        p_normal = {"soil_moisture": 55, "temperature": 28.0, "humidity": 60.0, "is_raining": False}
        res_norm = self.client.post('/api/iot/data/', p_normal, format='json')
        self.assertEqual(res_norm.data['notifications_generated'], 1)

        recovery = Notification.objects.filter(notification_type='soil', level='success').first()
        self.assertIsNotNone(recovery)
        self.assertIn('returned to normal', recovery.title.lower())

    def test_temperature_and_rain_state_machine(self):
        # Temperature > 35°C
        p_hot = {"soil_moisture": 55, "temperature": 37.2, "humidity": 60.0, "is_raining": False}
        res_hot = self.client.post('/api/iot/data/', p_hot, format='json')
        self.assertEqual(res_hot.status_code, status.HTTP_201_CREATED)
        temp_notif = Notification.objects.filter(notification_type='temperature', level='critical').first()
        self.assertIsNotNone(temp_notif)
        self.assertIn('high temperature', temp_notif.title.lower())

        # Rain detected
        p_rain = {"soil_moisture": 55, "temperature": 28.0, "humidity": 80.0, "is_raining": True}
        res_rain = self.client.post('/api/iot/data/', p_rain, format='json')
        self.assertEqual(res_rain.status_code, status.HTTP_201_CREATED)
        rain_notif = Notification.objects.filter(notification_type='rain').first()
        self.assertIsNotNone(rain_notif)
        self.assertEqual(rain_notif.title, 'Rain detected')

        # Rain stops
        p_dry = {"soil_moisture": 55, "temperature": 28.0, "humidity": 80.0, "is_raining": False}
        res_dry = self.client.post('/api/iot/data/', p_dry, format='json')
        self.assertEqual(res_dry.status_code, status.HTTP_201_CREATED)
        rain_stop = Notification.objects.filter(notification_type='rain', title='Rain stopped').first()
        self.assertIsNotNone(rain_stop)

    def test_notification_rest_endpoints(self):
        n1 = Notification.objects.create(notification_type='soil', level='critical', title='Soil dry', message='dry')
        n2 = Notification.objects.create(notification_type='rain', level='info', title='Rain', message='wet')

        # Check list endpoint
        res_list = self.client.get('/api/iot/notifications/')
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_list.data), 2)

        # Check unread count
        res_count = self.client.get('/api/iot/notifications/unread-count/')
        self.assertEqual(res_count.status_code, status.HTTP_200_OK)
        self.assertEqual(res_count.data['unread_count'], 2)

        # Mark single as read
        res_read = self.client.post(f'/api/iot/notifications/{n1.id}/read/')
        self.assertEqual(res_read.status_code, status.HTTP_200_OK)
        n1.refresh_from_db()
        self.assertTrue(n1.is_read)

        # Mark all read
        res_all = self.client.post('/api/iot/notifications/read-all/')
        self.assertEqual(res_all.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(is_read=False).count(), 0)
