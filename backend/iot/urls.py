from django.urls import path
from .views import (
    receive_sensor_data,
    latest_sensor_data,
    sensor_history,
    device_status,
    field_summary,
    notification_list,
    notification_unread_count,
    mark_notification_read,
    mark_all_notifications_read,
    alert_list,
    mark_alert_read,
    mark_all_alerts_read,
    nlp_assistant,
    pump_control,
)

urlpatterns = [
    # Telemetry
    path('data/', receive_sensor_data, name='iot-data'),
    path('latest/', latest_sensor_data, name='iot-latest'),
    path('history/', sensor_history, name='iot-history'),
    path('device-status/', device_status, name='iot-device-status'),
    path('summary/', field_summary, name='iot-summary'),

    # Notification System Endpoints
    path('notifications/', notification_list, name='iot-notifications'),
    path('notifications/unread-count/', notification_unread_count, name='iot-notifications-count'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='iot-notification-read'),
    path('notifications/read-all/', mark_all_notifications_read, name='iot-notifications-read-all'),

    # Preserved Alert Endpoints
    path('alerts/', alert_list, name='iot-alerts'),
    path('alerts/<int:alert_id>/read/', mark_alert_read, name='iot-alert-read'),
    path('alerts/read-all/', mark_all_alerts_read, name='iot-alerts-read-all'),

    # NLP Assistant
    path('assistant/', nlp_assistant, name='iot-nlp-assistant'),

    # Legacy Pump
    path('pump/', pump_control, name='iot-pump-legacy'),
]
