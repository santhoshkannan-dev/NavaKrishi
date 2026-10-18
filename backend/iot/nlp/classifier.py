import re

INTENTS = {
    'GET_SOIL': [
        'soil', 'moisture', 'water level in ground', 'ground water', 'dry', 'wet', 'soil moisture'
    ],
    'GET_TEMPERATURE': [
        'temperature', 'temp', 'hot', 'cold', 'degree', 'heat', 'warm'
    ],
    'GET_HUMIDITY': [
        'humidity', 'humid', 'atmospheric moisture', 'air moisture'
    ],
    'GET_RAIN': [
        'rain', 'raining', 'precipitation', 'shower', 'downpour', 'monsoon'
    ],
    'GET_FIELD_STATUS': [
        'field condition', 'field status', 'overall condition', 'how is my field',
        'is my field good', 'is my field okay', 'health', 'condition of field', 'summary'
    ],
    'GET_ALERTS': [
        'alert', 'alerts', 'warning', 'warnings', 'critical', 'issue', 'problem'
    ],
    'EXPLAIN_ALERT': [
        'why did i get an alert', 'why alert', 'explain alert', 'what happened'
    ],
    'GET_DAILY_SUMMARY': [
        'today', 'daily summary', 'what happened today', 'past 24 hours', 'last 24 hours'
    ],
    'GREETING': [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'
    ]
}


def classify_intent(text):
    """
    Intent classifier using token matching and scoring.
    Explainable NLP suitable for academic evaluation.
    """
    normalized = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower()).strip()
    words = set(normalized.split())

    best_intent = 'UNKNOWN'
    best_score = 0

    for intent, patterns in INTENTS.items():
        score = 0
        for pattern in patterns:
            pattern_words = pattern.split()
            if pattern in normalized:
                score += len(pattern_words) * 2
            elif all(pw in words for pw in pattern_words):
                score += len(pattern_words)

        if score > best_score:
            best_score = score
            best_intent = intent

    return best_intent, best_score
