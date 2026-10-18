from dataclasses import dataclass


MODEL_VERSION = 'climate-rules-v1'


@dataclass(frozen=True)
class CropProfile:
    name: str
    seasons: tuple[str, ...]
    rainfall: tuple[float, float]
    temperature: tuple[float, float]
    ph: tuple[float, float]
    category: str
    water_requirement: str
    explanation: str


CROP_PROFILES = (
    CropProfile('Tomato', ('summer', 'monsoon'), (400, 900), (18, 32), (5.5, 7.0), 'Vegetable', 'Moderate', 'Fits warm conditions and a moderately acidic to neutral soil range.'),
    CropProfile('Carrot', ('winter',), (300, 700), (10, 24), (5.5, 7.0), 'Root vegetable', 'Moderate', 'Prefers cooler temperatures and well-drained soil.'),
    CropProfile('Spinach', ('winter', 'monsoon'), (400, 1000), (10, 28), (6.0, 7.5), 'Leafy green', 'Moderate', 'Tolerates a broad rainfall range when temperatures stay moderate.'),
    CropProfile('Millet', ('summer', 'monsoon'), (250, 750), (20, 35), (5.5, 8.0), 'Grain', 'Low', 'Handles warm conditions and lower rainfall better than the other profiles.'),
)


def _range_score(value, bounds):
    low, high = bounds
    if low <= value <= high:
        return 100.0
    distance = low - value if value < low else value - high
    width = max(high - low, 1)
    return max(0.0, 100.0 - (distance / width) * 50.0)


def analyze_scenario(*, season, expected_rainfall, min_temperature, max_temperature, soil_ph):
    average_temperature = (min_temperature + max_temperature) / 2
    ranked = []
    for profile in CROP_PROFILES:
        season_score = 100 if season in profile.seasons else 45
        score = round(
            season_score * 0.25
            + _range_score(expected_rainfall, profile.rainfall) * 0.25
            + _range_score(average_temperature, profile.temperature) * 0.25
            + _range_score(soil_ph, profile.ph) * 0.25,
            1,
        )
        ranked.append({
            'name': profile.name,
            'suitability_score': score,
            'score_type': 'rule-based suitability score, not model probability',
            'category': profile.category,
            'water_requirement': profile.water_requirement,
            'explanation': profile.explanation,
        })

    ranked.sort(key=lambda item: (-item['suitability_score'], item['name']))
    rainfall_risk = 'High' if expected_rainfall < 300 or expected_rainfall > 1200 else ('Moderate' if expected_rainfall < 450 or expected_rainfall > 950 else 'Low')
    temperature_risk = 'High' if min_temperature < 5 or max_temperature > 40 else ('Moderate' if min_temperature < 10 or max_temperature > 35 else 'Low')
    ph_risk = 'High' if soil_ph < 5 or soil_ph > 8.5 else ('Moderate' if soil_ph < 5.5 or soil_ph > 7.5 else 'Low')
    risk_level = max((rainfall_risk, temperature_risk, ph_risk), key=('Low', 'Moderate', 'High').index)

    return {
        'model_version': MODEL_VERSION,
        'method': 'Transparent climate and soil-pH suitability rules. No trained ML artifact is installed in this repository.',
        'recommendations': ranked[:3],
        'risks': [
            {'name': 'Water stress', 'level': rainfall_risk, 'reason': 'Based on expected seasonal rainfall only.', 'mitigation': 'Review irrigation capacity and local forecast before planting.'},
            {'name': 'Temperature suitability', 'level': temperature_risk, 'reason': 'Based on the submitted minimum and maximum temperatures.', 'mitigation': 'Use season-appropriate varieties or protected cultivation where available.'},
            {'name': 'Soil pH suitability', 'level': ph_risk, 'reason': 'Based on the submitted soil pH and profile ranges.', 'mitigation': 'Confirm soil test results before applying amendments.'},
        ],
        'risk_summary': risk_level,
        'yield': {'available': False, 'value': None, 'unit': None, 'reason': 'No validated yield model or cultivated area is configured.'},
        'revenue': {'available': False, 'value': None, 'currency': 'INR', 'reason': 'No validated yield, area, or current price source is configured.'},
        'accuracy': {'available': False, 'value': None, 'reason': 'This is a transparent rule-based ranking; no evaluated ML accuracy is available.'},
        'assumptions': ['Rainfall is millimetres per season.', 'Temperature is degrees Celsius.', 'Suitability scores rank the configured rules and are not calibrated probabilities.'],
    }