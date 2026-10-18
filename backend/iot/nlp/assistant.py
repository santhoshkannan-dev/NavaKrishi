from django.utils import timezone
from datetime import timedelta
from ..models import SensorData, Alert
from ..health import calculate_field_health
from .classifier import classify_intent

# Global in-memory conversation context per session/client
CONTEXT_STORE = {}


def process_query(message, session_id='default'):
    """
    Processes a natural-language question from the farmer against real IoT sensor readings.
    Includes context memory for follow-up questions (e.g. 'Is that normal?').
    """
    if not message or not message.strip():
        return {
            'response': 'Please enter a question about your field conditions.',
            'intent': 'EMPTY',
            'entities': []
        }

    message_clean = message.strip()
    intent, score = classify_intent(message_clean)

    # Context retrieval
    prev_context = CONTEXT_STORE.get(session_id, {})
    prev_topic = prev_context.get('last_topic')

    # Resolve context for follow-up queries like "Is that normal?", "What about now?", "Is it safe?"
    follow_up_triggers = ['is that', 'is it', 'safe', 'normal', 'okay', 'bad', 'good']
    if intent in ['UNKNOWN', 'GET_FIELD_STATUS'] and prev_topic and any(t in message_clean.lower() for t in follow_up_triggers):
        if prev_topic == 'temperature':
            intent = 'GET_TEMPERATURE'
        elif prev_topic == 'soil':
            intent = 'GET_SOIL'
        elif prev_topic == 'humidity':
            intent = 'GET_HUMIDITY'
        elif prev_topic == 'rain':
            intent = 'GET_RAIN'

    latest = SensorData.objects.first()

    if not latest and intent not in ['GREETING']:
        return {
            'response': 'No live sensor data is recorded in the database yet. Once your ESP32 streams telemetry, I will analyze your field.',
            'intent': intent,
            'entities': []
        }

    response_text = ""
    entities = []

    if intent == 'GREETING':
        response_text = "Hello Farmer! 👋 I am your NavaKrishi Field Intelligence assistant. You can ask me about soil moisture, temperature, humidity, rainfall, or active alerts."
        CONTEXT_STORE[session_id] = {'last_topic': 'general'}

    elif intent == 'GET_SOIL':
        moisture = latest.soil_moisture
        entities.append('soil_moisture')
        if moisture < 20:
            status_desc = "critically dry (below 20% critical threshold)"
        elif moisture < 35:
            status_desc = "getting low (below 35% warning threshold)"
        elif moisture > 80:
            status_desc = "saturated"
        else:
            status_desc = "optimal (within 35% - 80% range)"

        response_text = f"Your latest soil moisture reading is {moisture}%. This is classified as {status_desc}."
        CONTEXT_STORE[session_id] = {'last_topic': 'soil', 'value': moisture}

    elif intent == 'GET_TEMPERATURE':
        temp = latest.temperature
        entities.append('temperature')
        if temp > 35:
            status_desc = "above the configured 35°C comfort threshold"
        elif temp < 10:
            status_desc = "below the configured 10°C cold threshold"
        else:
            status_desc = "in the comfortable crop environment range"

        response_text = f"The current field temperature is {temp:.1f}°C, which is {status_desc}."
        CONTEXT_STORE[session_id] = {'last_topic': 'temperature', 'value': temp}

    elif intent == 'GET_HUMIDITY':
        hum = latest.humidity
        entities.append('humidity')
        status_desc = "high" if hum > 85 else "low" if hum < 30 else "normal"
        response_text = f"Atmospheric humidity is currently {hum:.1f}%, indicating {status_desc} atmospheric moisture."
        CONTEXT_STORE[session_id] = {'last_topic': 'humidity', 'value': hum}

    elif intent == 'GET_RAIN':
        is_raining = latest.rain_detected
        entities.append('rain_detected')
        if is_raining:
            response_text = f"Yes, precipitation is actively detected by the field sensor. Soil moisture is at {latest.soil_moisture}%."
        else:
            response_text = "No rain is detected by your field sensor. Conditions are currently dry."
        CONTEXT_STORE[session_id] = {'last_topic': 'rain', 'value': is_raining}

    elif intent == 'GET_FIELD_STATUS':
        health = calculate_field_health(latest)
        response_text = f"Your field health score is {health['score']}/100 with status {health['condition']}. {health['explanation']}"
        CONTEXT_STORE[session_id] = {'last_topic': 'health', 'value': health['score']}

    elif intent in ['GET_ALERTS', 'EXPLAIN_ALERT']:
        recent_alerts = Alert.objects.filter(is_read=False)[:3]
        if recent_alerts.exists():
            alert_summaries = [f"• [{a.severity.upper()}] {a.title}: {a.message}" for a in recent_alerts]
            response_text = "Active field alerts:\n" + "\n".join(alert_summaries)
        else:
            response_text = "There are currently no active warnings or unread alerts. All parameters are stable."
        CONTEXT_STORE[session_id] = {'last_topic': 'alerts'}

    elif intent == 'GET_DAILY_SUMMARY':
        now = timezone.now()
        yesterday = now - timedelta(hours=24)
        history = list(SensorData.objects.filter(created_at__gte=yesterday))

        if history:
            moistures = [h.soil_moisture for h in history]
            temps = [h.temperature for h in history]
            avg_m = sum(moistures) / len(moistures)
            avg_t = sum(temps) / len(temps)
            rain_events = any(h.rain_detected for h in history)
            rain_str = "Rainfall was recorded" if rain_events else "No rainfall was recorded"

            response_text = f"Past 24 Hours Summary: Average soil moisture was {avg_m:.1f}%, average temperature was {avg_t:.1f}°C. {rain_str} over {len(history)} recorded telemetry points."
        else:
            response_text = f"Current reading: Soil moisture is {latest.soil_moisture}%, temperature is {latest.temperature:.1f}°C, and humidity is {latest.humidity:.1f}%."
        CONTEXT_STORE[session_id] = {'last_topic': 'summary'}

    else:
        response_text = "I couldn't match that to available sensor metrics. You can ask: 'Is my field condition good?', 'What is the temperature?', 'Is my soil dry?', or 'Did it rain?'"

    return {
        'response': response_text,
        'intent': intent,
        'entities': entities,
        'timestamp': timezone.now().isoformat()
    }
