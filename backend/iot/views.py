from django.utils import timezone
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import SensorData, Notification, Alert, PumpCommand
from .serializers import SensorDataSerializer, NotificationSerializer, AlertSerializer, PumpCommandSerializer
from .alerts import evaluate_sensor_alerts
from .health import calculate_field_health
from .nlp.assistant import process_query

ONLINE_THRESHOLD_SECONDS = 30
WARNING_THRESHOLD_SECONDS = 120


def _coerce_bool(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {'1', 'true', 'on', 'yes'}:
            return True
        if normalized in {'0', 'false', 'off', 'no'}:
            return False
    return default


def _normalize_sensor_payload(payload):
    if not isinstance(payload, dict):
        return {}

    soil = payload.get('soil_moisture')
    if soil is None:
        soil = payload.get('moisture', payload.get('soilMoisture'))

    temp = payload.get('temperature')
    if temp is None:
        temp = payload.get('temp', payload.get('temp_c'))

    humidity = payload.get('humidity')
    if humidity is None:
        humidity = payload.get('hum', payload.get('humidity_percent'))

    rain_raw = payload.get('is_raining')
    if rain_raw is None:
        rain_raw = payload.get('rain_detected', payload.get('rain'))

    return {
        'temperature': temp,
        'humidity': humidity,
        'soil_moisture': soil,
        'rain_detected': _coerce_bool(rain_raw, default=False),
    }


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def receive_sensor_data(request):
    """
    Receives live telemetry from NodeMCU / ESP.
    Validates, saves reading, triggers state-change notification engine, and returns response.
    """
    normalized = _normalize_sensor_payload(request.data)
    serializer = SensorDataSerializer(data=normalized)

    if serializer.is_valid():
        instance = serializer.save()
        # Analyze thresholds with state-change + cooldown logic
        new_notifications = evaluate_sensor_alerts(instance)
        
        return Response(
            {
                'status': 'success',
                'message': 'Sensor reading saved successfully.',
                'data': SensorDataSerializer(instance).data,
                'notifications_generated': len(new_notifications)
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        {
            'status': 'error',
            'detail': 'Invalid sensor payload.',
            'errors': serializer.errors,
            'received': request.data,
        },
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def latest_sensor_data(request):
    latest = SensorData.objects.first()
    if latest is None:
        return Response({'status': 'empty', 'detail': 'No sensor data available in the system.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = SensorDataSerializer(latest)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def sensor_history(request):
    qs = SensorData.objects.all()
    hours_param = request.query_params.get('hours')
    days_param = request.query_params.get('days')

    if hours_param:
        try:
            since = timezone.now() - timedelta(hours=float(hours_param))
            qs = qs.filter(created_at__gte=since)
        except ValueError:
            pass
    elif days_param:
        try:
            since = timezone.now() - timedelta(days=float(days_param))
            qs = qs.filter(created_at__gte=since)
        except ValueError:
            pass

    try:
        limit = int(request.query_params.get('limit', 100))
        limit = max(1, min(limit, 500))
    except (ValueError, TypeError):
        limit = 100

    results = qs[:limit]
    serializer = SensorDataSerializer(results, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def device_status(request):
    latest = SensorData.objects.first()

    if latest is None:
        return Response({
            'status': 'offline',
            'seconds_ago': None,
            'last_seen': None,
            'message': 'No sensor readings recorded yet. Node has never connected.',
        }, status=status.HTTP_200_OK)

    now = timezone.now()
    seconds_ago = int((now - latest.created_at).total_seconds())

    if seconds_ago <= ONLINE_THRESHOLD_SECONDS:
        dev_status = 'online'
        message = 'Device is online and actively transmitting telemetry.'
    elif seconds_ago <= WARNING_THRESHOLD_SECONDS:
        dev_status = 'warning'
        message = f'Telemetry packet is delayed ({seconds_ago}s ago).'
    else:
        dev_status = 'offline'
        message = f'Device appears offline. Last reading received {seconds_ago}s ago.'

    return Response({
        'status': dev_status,
        'seconds_ago': max(0, seconds_ago),
        'last_seen': latest.created_at.isoformat(),
        'message': message,
    }, status=status.HTTP_200_OK)


# =====================================================================
# NOTIFICATION SYSTEM ENDPOINTS
# =====================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def notification_list(request):
    """
    GET /api/iot/notifications/
    Returns list of notifications in descending chronological order.
    Query params:
    - unread=true : filter only unread
    - limit=50 : max items
    """
    qs = Notification.objects.all()

    if request.query_params.get('unread') == 'true':
        qs = qs.filter(is_read=False)

    try:
        limit = int(request.query_params.get('limit', 50))
    except (ValueError, TypeError):
        limit = 50

    notifications = qs[:limit]
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def notification_unread_count(request):
    """
    GET /api/iot/notifications/unread-count/
    Returns total number of unread notifications for badge display.
    """
    count = Notification.objects.filter(is_read=False).count()
    return Response({'unread_count': count}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def mark_notification_read(request, notification_id):
    """
    POST /api/iot/notifications/<id>/read/
    Marks a single notification as read.
    """
    try:
        n = Notification.objects.get(id=notification_id)
        n.is_read = True
        n.save()
        return Response({'status': 'success', 'id': notification_id, 'is_read': True}, status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def mark_all_notifications_read(request):
    """
    POST /api/iot/notifications/read-all/
    Marks all notifications as read.
    """
    count = Notification.objects.filter(is_read=False).update(is_read=True)
    # Also update legacy Alert table
    Alert.objects.filter(is_read=False).update(is_read=True)
    return Response({'status': 'success', 'marked_read_count': count}, status=status.HTTP_200_OK)


# Preserved Alert alias endpoints
@api_view(['GET'])
@permission_classes([AllowAny])
def alert_list(request):
    alerts = Alert.objects.all()[:50]
    serializer = AlertSerializer(alerts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def mark_alert_read(request, alert_id):
    try:
        alert = Alert.objects.get(id=alert_id)
        alert.is_read = True
        alert.save()
        return Response({'status': 'success', 'id': alert_id})
    except Alert.DoesNotExist:
        return Response({'detail': 'Alert not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def mark_all_alerts_read(request):
    count = Alert.objects.filter(is_read=False).update(is_read=True)
    Notification.objects.filter(is_read=False).update(is_read=True)
    return Response({'status': 'success', 'updated_count': count})


@api_view(['GET'])
@permission_classes([AllowAny])
def field_summary(request):
    latest = SensorData.objects.first()
    health = calculate_field_health(latest)

    if latest:
        now = timezone.now()
        seconds_ago = int((now - latest.created_at).total_seconds())
        dev_status = 'online' if seconds_ago <= ONLINE_THRESHOLD_SECONDS else ('warning' if seconds_ago <= WARNING_THRESHOLD_SECONDS else 'offline')
        last_seen = latest.created_at.isoformat()
    else:
        seconds_ago = None
        dev_status = 'offline'
        last_seen = None

    unread_notifs = Notification.objects.filter(is_read=False).count()
    latest_notifs = Notification.objects.all()[:5]

    return Response({
        'current_reading': SensorDataSerializer(latest).data if latest else None,
        'field_health': health,
        'device_status': {
            'status': dev_status,
            'seconds_ago': seconds_ago,
            'last_seen': last_seen,
        },
        'active_alert_count': unread_notifs,
        'unread_notifications_count': unread_notifs,
        'latest_notifications': NotificationSerializer(latest_notifs, many=True).data,
        'latest_alerts': NotificationSerializer(latest_notifs, many=True).data,
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def nlp_assistant(request):
    message = request.data.get('message', '')
    session_id = request.data.get('session_id', 'default')
    result = process_query(message, session_id=session_id)
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def pump_control(request):
    if request.method == 'GET':
        latest = PumpCommand.objects.first()
        if latest is None:
            return Response({'manual_mode': False, 'pump': False, 'created_at': None})
        serializer = PumpCommandSerializer(latest)
        return Response(serializer.data)

    latest = PumpCommand.objects.first()
    pump_on = request.data.get('pump', request.data.get('pump_on', request.data.get('is_on')))
    manual_mode = request.data.get('manual_mode', True)

    if pump_on is None and latest is not None:
        pump_on = latest.pump_on

    pump_on = _coerce_bool(pump_on)
    manual_mode = _coerce_bool(manual_mode, default=True)

    serializer = PumpCommandSerializer(data={'pump_on': pump_on, 'manual_mode': manual_mode})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)
