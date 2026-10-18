import json
import re
import ssl
from collections import Counter
from urllib.parse import quote_plus
from urllib.request import urlopen

from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Product, SupportArticle
from .serializers import ProductSerializer


INTENT_LABELS = {
    "disease_query": "Disease Query",
    "irrigation": "Irrigation",
    "weather": "Weather Forecast",
    "crop_recommendation": "Crop Recommendation",
    "soil_problem": "Soil Problem",
    "growth_issue": "Growth Issue",
    "complaint_analysis": "Complaint Analysis",
    "marketplace_search": "Marketplace Search",
    "product_description": "Product Description",
    "general_farming": "General Farming Advice",
}

INTENT_KEYWORDS = {
    "weather": ["rain", "weather", "forecast", "tomorrow", "storm", "precipitation"],
    "irrigation": ["water", "watering", "irrigate", "moisture", "dry", "dry soil"],
    "crop_recommendation": ["best crop", "which crop", "suitable crop", "recommend crop", "best season"],
    "soil_problem": ["soil health", "soil problem", "soil dry", "dry soil", "soil moisture", "ph"],
    "growth_issue": ["growing slowly", "slow growth", "stunted", "not growing", "growth issue"],
    "disease_query": ["yellow leaves", "fungal", "blight", "spots", "wilt", "pest", "leaf curl"],
    "complaint_analysis": ["late", "damaged", "complaint", "review", "delivery", "broken", "bad"],
    "marketplace_search": ["good for", "protein rich", "diabetes", "search", "find", "best selling"],
    "product_description": ["description", "listing", "write description", "product copy", "seo"],
}

CROP_SYNONYMS = {
    "tomato": ["tomato", "tomatoes"],
    "potato": ["potato", "potatoes"],
    "onion": ["onion", "onions"],
    "chili": ["chili", "chilli", "pepper"],
    "cucumber": ["cucumber", "cucumbers"],
    "spinach": ["spinach"],
    "cabbage": ["cabbage"],
    "cauliflower": ["cauliflower"],
    "rice": ["rice"],
    "wheat": ["wheat"],
    "maize": ["maize", "corn"],
    "okra": ["okra", "ladyfinger"],
    "brinjal": ["brinjal", "eggplant"],
    "beans": ["beans", "bean"],
    "carrot": ["carrot", "carrots"],
    "mango": ["mango", "mangoes"],
}

DISEASE_KB = {
    "tomato": {
        "yellow leaves": {
            "possible_causes": ["Nitrogen deficiency", "Early blight", "Water stress"],
            "recommended_actions": [
                "Add nitrogen-rich fertilizer",
                "Inspect leaves for fungal spots",
                "Adjust watering to keep soil evenly moist",
            ],
        },
        "leaf curl": {
            "possible_causes": ["Whitefly pressure", "Heat stress", "Viral infection"],
            "recommended_actions": [
                "Check for whiteflies on the underside of leaves",
                "Use reflective mulch or sticky traps",
                "Remove heavily infected plants early",
            ],
        },
    },
    "potato": {
        "yellow leaves": {
            "possible_causes": ["Nitrogen deficiency", "Late blight", "Overwatering"],
            "recommended_actions": [
                "Top dress with balanced fertilizer",
                "Reduce excess watering",
                "Remove infected foliage and improve airflow",
            ],
        }
    },
}

CROP_PROFILES = [
    {"name": "Tomato", "temp": (18, 30), "humidity": (45, 80), "moisture": (35, 65), "labels": ["vegetable", "cash crop"]},
    {"name": "Spinach", "temp": (10, 24), "humidity": (40, 85), "moisture": (45, 75), "labels": ["leafy", "cool season"]},
    {"name": "Cucumber", "temp": (20, 32), "humidity": (50, 85), "moisture": (40, 70), "labels": ["vine", "warm season"]},
    {"name": "Rice", "temp": (24, 35), "humidity": (65, 95), "moisture": (70, 98), "labels": ["paddy", "high water"]},
    {"name": "Wheat", "temp": (12, 26), "humidity": (35, 65), "moisture": (25, 55), "labels": ["grain", "cool season"]},
    {"name": "Maize", "temp": (18, 32), "humidity": (40, 80), "moisture": (35, 65), "labels": ["grain", "staple"]},
    {"name": "Okra", "temp": (22, 35), "humidity": (40, 75), "moisture": (35, 65), "labels": ["vegetable", "heat tolerant"]},
    {"name": "Cabbage", "temp": (12, 24), "humidity": (45, 80), "moisture": (45, 75), "labels": ["cool season", "leafy"]},
]

POSITIVE_WORDS = {"good", "great", "fresh", "healthy", "strong", "excellent", "best", "recommended"}
NEGATIVE_WORDS = {"late", "damaged", "broken", "poor", "bad", "worse", "issue", "complaint", "dirty"}


def _clean_text(text):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9%\.\s]", " ", (text or "").lower())).strip()


def _extract_numbers(text):
    matches = re.findall(r"(\d+(?:\.\d+)?)\s*%?", text or "")
    return [float(item) for item in matches]


def _find_crop(text):
    cleaned = _clean_text(text)
    for crop, aliases in CROP_SYNONYMS.items():
        if any(alias in cleaned for alias in aliases):
            return crop
    return ""


def _find_issue(text):
    cleaned = _clean_text(text)
    if ("yellow" in cleaned and "leaf" in cleaned) or "turning yellow" in cleaned or "yellowing" in cleaned:
        return "yellow leaves"
    issue_map = {
        "yellow leaves": ["yellow leaves", "yellow leaf", "chlorosis"],
        "dry soil": ["dry soil", "soil is dry", "very dry", "dryness"],
        "leaf curl": ["leaf curl", "curling leaves"],
        "slow growth": ["slow growth", "growing slowly", "stunted"],
        "fungal infection": ["fungal", "blight", "fungus", "spots"],
    }
    for issue, aliases in issue_map.items():
        if any(alias in cleaned for alias in aliases):
            return issue
    return ""


def _classify_intent(text, payload=None):
    payload = payload or {}
    cleaned = _clean_text(text)

    if payload.get("mode") == "description":
        return "product_description", 0.96

    scores = {intent: 0 for intent in INTENT_KEYWORDS}
    for intent, keywords in INTENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in cleaned:
                scores[intent] += 2 if " " in keyword else 1

    if payload.get("location") or payload.get("lat") or payload.get("lon"):
        scores["weather"] += 2

    if payload.get("title") and payload.get("category"):
        scores["product_description"] += 2

    if payload.get("query"):
        search_query = _clean_text(str(payload.get("query")))
        if any(keyword in search_query for keyword in ("search", "good for", "protein rich", "diabetes")):
            scores["marketplace_search"] += 2

    if payload.get("temperature") or payload.get("humidity") or payload.get("soil_moisture"):
        scores["crop_recommendation"] += 1

    if _find_crop(text) and _find_issue(text):
        scores["disease_query"] += 2

    if not any(scores.values()):
        return "general_farming", 0.62

    best_intent = max(scores, key=scores.get)
    best_score = scores[best_intent]
    confidence = min(0.96, 0.58 + best_score * 0.08)
    return best_intent, confidence


def _extract_entities(text, payload=None):
    payload = payload or {}
    crop = payload.get("crop") or _find_crop(text)
    issue = payload.get("problem") or _find_issue(text)
    numbers = _extract_numbers(text)

    soil_moisture = payload.get("soil_moisture") or payload.get("moisture")
    humidity = payload.get("humidity")
    temperature = payload.get("temperature")

    def _to_float(value):
        try:
            if value in (None, ""):
                return None
            return float(value)
        except (TypeError, ValueError):
            return None

    if soil_moisture is None and numbers and any(token in _clean_text(text) for token in ["moisture", "dry", "wet"]):
        soil_moisture = numbers[0]

    if humidity is None and numbers and "humidity" in _clean_text(text):
        humidity = numbers[0]

    if temperature is None and numbers and any(token in _clean_text(text) for token in ["temp", "temperature"]):
        temperature = numbers[0]

    entities = {
        "crop": crop.title() if crop else "",
        "problem": issue.title() if issue else "",
        "soil_moisture": _to_float(soil_moisture),
        "humidity": _to_float(humidity),
        "temperature": _to_float(temperature),
    }
    return {key: value for key, value in entities.items() if value not in (None, "")}


def _score_product(product, query_tokens):
    fields = " ".join([
        product.title or "",
        product.description or "",
        product.category.name if product.category else "",
        product.badge or "",
        getattr(product.farmer, "username", "") or "",
    ]).lower()

    score = 0.0
    for token in query_tokens:
        if token in fields:
            score += 2.0 if token in (product.title or "").lower() else 1.0

    if query_tokens and product.category and product.category.name.lower() in query_tokens:
        score += 3.0

    if product.badge:
        score += 0.3

    return score


def _format_score(score):
    return round(min(0.99, 0.4 + score / 10), 2)


def _fetch_json(url):
    request_context = ssl.create_default_context()
    with urlopen(url, timeout=7, context=request_context) as response:
        return json.loads(response.read().decode("utf-8"))


def _geocode_location(location):
    if not location:
        return None

    data = _fetch_json(
        f"https://geocoding-api.open-meteo.com/v1/search?name={quote_plus(location)}&count=1&language=en&format=json"
    )
    results = data.get("results") or []
    if not results:
        return None
    first = results[0]
    return {
        "name": first.get("name"),
        "latitude": first.get("latitude"),
        "longitude": first.get("longitude"),
        "country": first.get("country"),
        "admin1": first.get("admin1"),
    }


def _forecast_for_location(location_name=None, latitude=None, longitude=None):
    if latitude is None or longitude is None:
        geocoded = _geocode_location(location_name or "")
        if not geocoded:
            return None
        latitude = geocoded["latitude"]
        longitude = geocoded["longitude"]
        location_name = geocoded.get("name")

    data = _fetch_json(
        "https://api.open-meteo.com/v1/forecast?"
        f"latitude={latitude}&longitude={longitude}&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=2"
    )

    daily = data.get("daily") or {}
    rain_values = daily.get("precipitation_probability_max") or []
    temp_max = daily.get("temperature_2m_max") or []
    temp_min = daily.get("temperature_2m_min") or []

    tomorrow_rain = float(rain_values[1] if len(rain_values) > 1 else rain_values[0] if rain_values else 0)
    tomorrow_high = float(temp_max[1] if len(temp_max) > 1 else temp_max[0] if temp_max else 0)
    tomorrow_low = float(temp_min[1] if len(temp_min) > 1 else temp_min[0] if temp_min else 0)

    return {
        "location_name": location_name or data.get("timezone", "your area"),
        "rain_probability": round(tomorrow_rain),
        "temperature_max": round(tomorrow_high),
        "temperature_min": round(tomorrow_low),
    }


def _weather_recommendation(forecast):
    rain = forecast["rain_probability"]
    if rain >= 70:
        return "Avoid irrigation today and use rainwater planning for tomorrow."
    if rain >= 40:
        return "Delay irrigation if the soil is already moist."
    return "It is safe to irrigate today before evening."


def _recommend_crop(payload, text):
    def _float_or_none(value):
        try:
            return None if value in (None, "") else float(value)
        except (TypeError, ValueError):
            return None

    temperature = _float_or_none(payload.get("temperature"))
    humidity = _float_or_none(payload.get("humidity"))
    soil_moisture = _float_or_none(payload.get("soil_moisture") or payload.get("moisture"))

    if soil_moisture is None:
        numbers = _extract_numbers(text)
        if numbers:
            soil_moisture = numbers[0]

    scores = []
    for profile in CROP_PROFILES:
        score = 0.0

        if temperature is not None:
            low, high = profile["temp"]
            target = (low + high) / 2
            score += max(0.0, 1.0 - abs(temperature - target) / max((high - low), 1)) * 4.0

        if humidity is not None:
            low, high = profile["humidity"]
            target = (low + high) / 2
            score += max(0.0, 1.0 - abs(humidity - target) / max((high - low), 1)) * 3.0

        if soil_moisture is not None:
            low, high = profile["moisture"]
            target = (low + high) / 2
            score += max(0.0, 1.0 - abs(soil_moisture - target) / max((high - low), 1)) * 4.0

        if profile["name"].lower() in _clean_text(text):
            score += 1.5

        scores.append((score, profile))

    scores.sort(key=lambda item: item[0], reverse=True)
    best_score, best_profile = scores[0]
    confidence = _format_score(best_score)

    return {
        "recommended_crop": best_profile["name"],
        "confidence": confidence,
        "factors": [
            f"Temperature fit for {best_profile['name']}",
            f"Humidity range aligns with {best_profile['name']} growth",
            f"Soil moisture pattern favors {best_profile['name']}" if soil_moisture is not None else f"General climate match for {best_profile['name']}",
        ],
    }


def _sentiment_breakdown(text):
    tokens = re.findall(r"[a-z]+", (text or "").lower())
    counts = Counter(tokens)
    positive = sum(counts[word] for word in POSITIVE_WORDS)
    negative = sum(counts[word] for word in NEGATIVE_WORDS)
    score = positive - negative

    if score > 0:
        label = "Positive"
    elif score < 0:
        label = "Negative"
    else:
        label = "Neutral"

    return {
        "label": label,
        "score": score,
        "positive_signals": sorted(word for word in POSITIVE_WORDS if word in counts),
        "negative_signals": sorted(word for word in NEGATIVE_WORDS if word in counts),
    }


def _product_description(payload):
    title = (payload.get("title") or "Organic farm product").strip()
    category = (payload.get("category") or "fresh produce").strip()
    tone = (payload.get("tone") or "trusted").strip()
    highlights = payload.get("highlights") or payload.get("keywords") or payload.get("notes") or []
    if isinstance(highlights, str):
        highlights = [part.strip() for part in re.split(r"[,;\n]", highlights) if part.strip()]
    else:
        highlights = [str(part).strip() for part in highlights if str(part).strip()]

    qualities = highlights[:4]
    quality_text = ", ".join(qualities) if qualities else "carefully harvested and sorted"

    description = (
        f"{title} is a {tone} {category} grown for freshness, consistency, and farmer-led quality control. "
        f"It is {quality_text}, making it a practical choice for households, retailers, and bulk buyers seeking reliable supply. "
        "Cultivated with attention to soil health and post-harvest handling, this product is suitable for everyday use and marketplace listings that need strong conversion."
    )

    seo_title = f"Buy {title} Online | Fresh {category.title()}"
    keywords = [title, category] + qualities

    return {
        "seo_title": seo_title,
        "generated_description": description,
        "keywords": [keyword for keyword in dict.fromkeys(keyword for keyword in keywords if keyword)],
    }


def _general_farming_reply(text, entities):
    if entities.get("problem") and entities.get("crop"):
        return f"I found a possible crop issue for {entities['crop']}. Share moisture, temperature, or a photo for a more precise diagnosis."
    if "water" in _clean_text(text):
        return "Check current soil moisture before irrigating. If it is below 35%, start watering today."
    return "Ask about crop disease, irrigation, crop choice, weather, marketplace search, or product descriptions and I will break it down."


def _lookup_support_articles(query):
    query_tokens = [token for token in re.findall(r"[a-z0-9]+", (query or "").lower()) if len(token) > 2]
    if not query_tokens:
        return []

    articles = []
    for article in SupportArticle.objects.filter(is_published=True):
        haystack = " ".join([article.category, article.question, article.answer]).lower()
        score = sum(1 for token in query_tokens if token in haystack)
        if score:
            articles.append((score, article))

    articles.sort(key=lambda item: item[0], reverse=True)
    return [
        {
            "id": article.id,
            "category": article.category,
            "question": article.question,
            "answer": article.answer,
        }
        for score, article in articles[:3]
    ]


def _search_products(query):
    normalized = _clean_text(query)
    query_tokens = [token for token in re.findall(r"[a-z0-9]+", normalized) if len(token) > 1]

    products = Product.objects.select_related("category", "farmer").filter(is_active=True)
    scored = []

    for product in products:
        score = _score_product(product, query_tokens)
        if score > 0:
            scored.append((score, product))

    if not scored:
        fallback = products.filter(Q(title__icontains=query) | Q(description__icontains=query) | Q(category__name__icontains=query))[:8]
        return [
            {
                **ProductSerializer(product).data,
                "score": 0,
                "match_confidence": 55,
            }
            for product in fallback
        ]

    scored.sort(key=lambda item: item[0], reverse=True)
    return [
        {
            **ProductSerializer(product).data,
            "score": round(score, 2),
            "match_confidence": round(_format_score(score) * 100),
        }
        for score, product in scored[:8]
    ]


def _analyze_intent_response(text, payload=None):
    payload = payload or {}
    intent, confidence = _classify_intent(text, payload)
    entities = _extract_entities(text, payload)
    normalized_text = _clean_text(text)

    possible_causes = []
    recommended_actions = []
    data_points = []
    response_lines = []

    if intent == "disease_query":
        crop_key = (entities.get("crop") or _find_crop(text) or "").lower()
        issue_key = (entities.get("problem") or _find_issue(text) or "").lower()
        kb = DISEASE_KB.get(crop_key, {}).get(issue_key) or DISEASE_KB.get(crop_key, {}).get("yellow leaves")

        if kb:
            possible_causes = kb["possible_causes"]
            recommended_actions = kb["recommended_actions"]
        else:
            possible_causes = ["Nitrogen deficiency", "Pest pressure", "Water stress"]
            recommended_actions = ["Inspect leaves closely", "Review irrigation schedule", "Check nutrient balance"]

        crop_name = entities.get("crop") or "your crop"
        issue_name = entities.get("problem") or "symptoms"
        response_lines = [
            f"Possible causes for {crop_name} {issue_name.lower()}:",
            *[f"• {item}" for item in possible_causes],
            "",
            "Recommended actions:",
            *[f"✓ {item}" for item in recommended_actions],
        ]

    elif intent in {"soil_problem", "irrigation"}:
        moisture = entities.get("soil_moisture")
        if moisture is None:
            moisture = 29.0 if any(word in normalized_text for word in ["dry", "dry soil"]) else 42.0
        recommended_moisture = 45

        if moisture < 35:
            possible_causes = ["Low soil moisture", "High heat loss", "Under-irrigation"]
            recommended_actions = ["Increase irrigation frequency", "Mulch the soil to reduce evaporation", "Check drip lines for blockages"]
        else:
            possible_causes = ["Temporary heat stress", "Recent irrigation imbalance"]
            recommended_actions = ["Continue monitoring moisture", "Avoid overwatering", "Inspect soil drainage"]

        data_points = [
            {"label": "Current soil moisture", "value": round(float(moisture))},
            {"label": "Recommended moisture", "value": recommended_moisture},
        ]
        response_lines = [
            f"Current soil moisture is {round(float(moisture))}%.",
            f"Recommended moisture: {recommended_moisture}%.",
            "",
            "Recommended action:",
            *[f"✓ {item}" for item in recommended_actions],
        ]

    elif intent == "weather":
        forecast = _forecast_for_location(payload.get("location"), payload.get("lat"), payload.get("lon"))
        if forecast:
            recommendation = _weather_recommendation(forecast)
            data_points = [
                {"label": "Chance of rain", "value": forecast["rain_probability"], "unit": "%"},
                {"label": "High", "value": forecast["temperature_max"], "unit": "°C"},
                {"label": "Low", "value": forecast["temperature_min"], "unit": "°C"},
            ]
            response_lines = [
                f"Chance of rain tomorrow in {forecast['location_name']}: {forecast['rain_probability']}%.",
                recommendation,
            ]
            recommended_actions = [recommendation]
        else:
            response_lines = ["I could not fetch live weather for that location. Please share a city name or coordinates."]

    elif intent == "crop_recommendation":
        crop_result = _recommend_crop(payload, text)
        response_lines = [
            "Recommended crop:",
            f"{crop_result['recommended_crop']}",
            f"Confidence {round(crop_result['confidence'] * 100)}%",
        ]
        data_points = [
            {"label": "Confidence", "value": round(crop_result["confidence"] * 100), "unit": "%"},
        ]
        recommended_actions = crop_result["factors"]

    elif intent == "growth_issue":
        possible_causes = ["Low soil moisture", "High temperature", "Nitrogen deficiency"]
        recommended_actions = ["Check moisture immediately", "Test soil nutrient levels", "Avoid midday irrigation"]
        response_lines = [
            "Possible reasons for slow growth:",
            *[f"• {item}" for item in possible_causes],
            "",
            "Recommended actions:",
            *[f"✓ {item}" for item in recommended_actions],
        ]

    elif intent == "complaint_analysis":
        sentiment = _sentiment_breakdown(text)
        response_lines = [
            f"Sentiment detected: {sentiment['label']}",
            "Key complaint themes:",
            "• Delivery timing",
            "• Product quality",
            "• Packaging or handling",
        ]
        possible_causes = ["Operational delay", "Damaged packaging", "Poor handling in transit"]
        recommended_actions = ["Escalate the delivery issue", "Offer replacement or refund options", "Audit the dispatch process"]

    elif intent == "marketplace_search":
        results = _search_products(payload.get("query") or text)
        top_names = [item["title"] for item in results[:5]]
        response_lines = ["Top marketplace matches:"]
        response_lines.extend([f"• {name}" for name in top_names] if top_names else ["• No strong matches found"])
        recommended_actions = ["Try a more specific product need", "Use category or benefit-based wording"]
        possible_causes = ["Semantic search matched product titles and descriptions"]

    else:
        response_lines = [_general_farming_reply(text, entities)]
        if entities.get("crop"):
            possible_causes = [f"Crop detected: {entities['crop']}"]

    articles = _lookup_support_articles(text)

    return {
        "intent": {
            "label": INTENT_LABELS.get(intent, intent.replace("_", " ").title()),
            "slug": intent,
            "confidence": round(confidence * 100),
        },
        "entities": entities,
        "possible_causes": possible_causes,
        "recommended_actions": recommended_actions,
        "data_points": data_points,
        "support_articles": articles,
        "pipeline": [
            "text_cleaning",
            "tokenization",
            "intent_classification",
            "entity_extraction",
            "knowledge_base_lookup",
            "response_generation",
        ],
        "response": "\n".join(response_lines).strip(),
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def assistant_chat(request):
    payload = request.data if isinstance(request.data, dict) else {}
    text = str(payload.get("message") or payload.get("query") or "").strip()

    if not text:
        return Response({"detail": "message is required"}, status=status.HTTP_400_BAD_REQUEST)

    result = _analyze_intent_response(text, payload)
    result["spoken_response"] = result["response"]
    return Response(result)


@api_view(["POST"])
@permission_classes([AllowAny])
def assistant_weather(request):
    payload = request.data if isinstance(request.data, dict) else {}
    location = str(payload.get("location") or payload.get("query") or "").strip()
    latitude = payload.get("lat")
    longitude = payload.get("lon")

    forecast = _forecast_for_location(location, latitude, longitude)
    if not forecast:
        return Response(
            {"detail": "Please provide a valid city name or coordinates."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    recommendation = _weather_recommendation(forecast)
    return Response(
        {
            "location": forecast["location_name"],
            "rain_probability": forecast["rain_probability"],
            "temperature_max": forecast["temperature_max"],
            "temperature_min": forecast["temperature_min"],
            "recommendation": recommendation,
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def assistant_search(request):
    payload = request.data if isinstance(request.data, dict) else {}
    query = str(payload.get("query") or payload.get("message") or "").strip()

    if not query:
        return Response({"detail": "query is required"}, status=status.HTTP_400_BAD_REQUEST)

    results = _search_products(query)
    return Response(
        {
            "query": query,
            "count": len(results),
            "results": results,
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def assistant_generate_description(request):
    payload = request.data if isinstance(request.data, dict) else {}
    title = str(payload.get("title") or "").strip()

    if not title:
        return Response({"detail": "title is required"}, status=status.HTTP_400_BAD_REQUEST)

    description = _product_description(payload)
    return Response(description)


@api_view(["POST"])
@permission_classes([AllowAny])
def assistant_crop_recommendation(request):
    payload = request.data if isinstance(request.data, dict) else {}
    result = _recommend_crop(payload, str(payload.get("query") or ""))
    return Response(result)
