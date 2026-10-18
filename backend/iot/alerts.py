from django.utils import timezone
from datetime import timedelta
from .models import Notification, Alert

# Cooldown window for identical state if condition persists (30 minutes)
STATE_COOLDOWN_MINUTES = 30


def evaluate_sensor_alerts(sensor_reading):
    """
    Analyzes incoming sensor reading using State-Change + Cooldown logic:
    - Soil: <30% (Critical), 30-50% (Warning), >=50% (Recovery Success)
    - Temperature: >35°C (Critical), <=35°C (Recovery Success)
    - Humidity: >85% (Warning), <=85% (Normalized Info)
    - Rain: Rain detected (Info), Rain stopped (Info)
    Does NOT flood notifications every 5 seconds!
    """
    if not sensor_reading:
        return []

    now = timezone.now()
    cutoff = now - timedelta(minutes=STATE_COOLDOWN_MINUTES)
    new_notifications = []

    moisture = sensor_reading.soil_moisture
    temp = sensor_reading.temperature
    humidity = sensor_reading.humidity
    is_raining = sensor_reading.rain_detected

    # -------------------------------------------------------------
    # 1. SOIL MOISTURE STATE-MACHINE (<30% Critical, 30-50% Warning, >=50% Normal)
    # -------------------------------------------------------------
    if moisture < 30:
        current_soil_state = 'critical'
    elif moisture <= 50:
        current_soil_state = 'warning'
    else:
        current_soil_state = 'normal'

    last_soil_notif = Notification.objects.filter(notification_type='soil').first()
    prev_soil_state = None
    last_soil_time = None
    if last_soil_notif:
        last_soil_time = last_soil_notif.created_at
        if last_soil_notif.level == 'critical':
            prev_soil_state = 'critical'
        elif last_soil_notif.level == 'warning':
            prev_soil_state = 'warning'
        elif last_soil_notif.level == 'success':
            prev_soil_state = 'normal'

    if current_soil_state == 'critical':
        if prev_soil_state != 'critical' or (last_soil_time and last_soil_time < cutoff):
            n = Notification.objects.create(
                notification_type='soil',
                level='critical',
                title='Soil moisture is very low',
                message=f'Soil moisture has dropped to {moisture}%. Urgent irrigation recommended.'
            )
            Alert.objects.create(alert_type='SOIL_CRITICAL', severity='critical', title=n.title, message=n.message, sensor_value=moisture)
            new_notifications.append(n)

    elif current_soil_state == 'warning':
        if prev_soil_state != 'warning' or (last_soil_time and last_soil_time < cutoff):
            n = Notification.objects.create(
                notification_type='soil',
                level='warning',
                title='Soil moisture is getting low',
                message=f'Soil moisture is at {moisture}%. Soil is drying out.'
            )
            Alert.objects.create(alert_type='SOIL_LOW', severity='warning', title=n.title, message=n.message, sensor_value=moisture)
            new_notifications.append(n)

    elif current_soil_state == 'normal':
        if prev_soil_state in ['critical', 'warning']:
            n = Notification.objects.create(
                notification_type='soil',
                level='success',
                title='Soil moisture returned to normal',
                message=f'Soil moisture has recovered to {moisture}%. Conditions are optimal.'
            )
            new_notifications.append(n)

    # -------------------------------------------------------------
    # 2. TEMPERATURE STATE-MACHINE (>35°C Critical, <=35°C Normal)
    # -------------------------------------------------------------
    current_temp_state = 'critical' if temp > 35.0 else 'normal'
    last_temp_notif = Notification.objects.filter(notification_type='temperature').first()
    prev_temp_state = None
    last_temp_time = None
    if last_temp_notif:
        last_temp_time = last_temp_notif.created_at
        if last_temp_notif.level in ['critical', 'warning']:
            prev_temp_state = 'critical'
        elif last_temp_notif.level == 'success':
            prev_temp_state = 'normal'

    if current_temp_state == 'critical':
        if prev_temp_state != 'critical' or (last_temp_time and last_temp_time < cutoff):
            n = Notification.objects.create(
                notification_type='temperature',
                level='critical',
                title='High temperature detected',
                message=f'Field temperature has reached {temp:.1f}°C, exceeding the 35°C threshold.'
            )
            Alert.objects.create(alert_type='HIGH_TEMPERATURE', severity='critical', title=n.title, message=n.message, sensor_value=temp)
            new_notifications.append(n)
    elif current_temp_state == 'normal':
        if prev_temp_state == 'critical':
            n = Notification.objects.create(
                notification_type='temperature',
                level='success',
                title='Temperature returned to normal',
                message=f'Field temperature has normalized to {temp:.1f}°C.'
            )
            new_notifications.append(n)

    # -------------------------------------------------------------
    # 3. HUMIDITY STATE-MACHINE (>85% Warning, <=85% Normal)
    # -------------------------------------------------------------
    current_hum_state = 'warning' if humidity > 85.0 else 'normal'
    last_hum_notif = Notification.objects.filter(notification_type='humidity').first()
    prev_hum_state = None
    last_hum_time = None
    if last_hum_notif:
        last_hum_time = last_hum_notif.created_at
        if last_hum_notif.level == 'warning':
            prev_hum_state = 'warning'
        elif last_hum_notif.level in ['info', 'success']:
            prev_hum_state = 'normal'

    if current_hum_state == 'warning':
        if prev_hum_state != 'warning' or (last_hum_time and last_hum_time < cutoff):
            n = Notification.objects.create(
                notification_type='humidity',
                level='warning',
                title='High humidity detected',
                message=f'Atmospheric humidity has risen to {humidity:.1f}%.'
            )
            Alert.objects.create(alert_type='HIGH_HUMIDITY', severity='warning', title=n.title, message=n.message, sensor_value=humidity)
            new_notifications.append(n)
    elif current_hum_state == 'normal':
        if prev_hum_state == 'warning':
            n = Notification.objects.create(
                notification_type='humidity',
                level='info',
                title='Humidity returned to normal',
                message=f'Atmospheric humidity has normalized to {humidity:.1f}%.'
            )
            new_notifications.append(n)

    # -------------------------------------------------------------
    # 4. RAIN STATE-MACHINE (Rain detected vs Rain stopped)
    # -------------------------------------------------------------
    last_rain_notif = Notification.objects.filter(notification_type='rain').first()
    prev_rain_state = None
    if last_rain_notif:
        if 'detected' in last_rain_notif.title.lower():
            prev_rain_state = True
        elif 'stopped' in last_rain_notif.title.lower():
            prev_rain_state = False

    if is_raining and prev_rain_state is not True:
        n = Notification.objects.create(
            notification_type='rain',
            level='info',
            title='Rain detected',
            message=f'Rainfall has been detected by the field sensor. Soil moisture is {moisture}%.'
        )
        Alert.objects.create(alert_type='RAIN_DETECTED', severity='info', title=n.title, message=n.message, sensor_value=moisture)
        new_notifications.append(n)
    elif not is_raining and prev_rain_state is True:
        n = Notification.objects.create(
            notification_type='rain',
            level='info',
            title='Rain stopped',
            message='Precipitation has stopped. Field rain sensor is dry.'
        )
        new_notifications.append(n)

    return new_notifications
