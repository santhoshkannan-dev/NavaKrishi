def calculate_field_health(sensor_reading):
    """
    Rule-based engineering index calculation based on soil moisture,
    temperature, humidity, and rain sensor state.
    Returns: score (0-100), condition (GOOD | WARNING | CRITICAL), explanation
    """
    if not sensor_reading:
        return {
            'score': 0,
            'condition': 'OFFLINE',
            'explanation': 'No telemetry received from field sensor node yet.',
            'breakdown': {
                'soil_penalty': 0,
                'temp_penalty': 0,
                'humidity_penalty': 0,
            }
        }

    moisture = sensor_reading.soil_moisture
    temp = sensor_reading.temperature
    humidity = sensor_reading.humidity
    is_raining = sensor_reading.rain_detected

    score = 100
    deductions = []

    # Soil evaluation
    soil_penalty = 0
    if moisture < 20:
        soil_penalty = 40
        deductions.append(f'Soil moisture critically low ({moisture}%)')
    elif moisture < 35:
        soil_penalty = 20
        deductions.append(f'Soil moisture is below optimal threshold ({moisture}%)')
    elif moisture > 85:
        soil_penalty = 15
        deductions.append(f'Soil is saturated ({moisture}%)')

    # Temperature evaluation
    temp_penalty = 0
    if temp > 38:
        temp_penalty = 35
        deductions.append(f'Severe heat stress ({temp:.1f}°C)')
    elif temp > 35:
        temp_penalty = 20
        deductions.append(f'Elevated temperature ({temp:.1f}°C)')
    elif temp < 10:
        temp_penalty = 25
        deductions.append(f'Cold stress detected ({temp:.1f}°C)')

    # Humidity evaluation
    humidity_penalty = 0
    if humidity > 90:
        humidity_penalty = 15
        deductions.append(f'Extreme humidity ({humidity:.1f}%)')
    elif humidity < 25:
        humidity_penalty = 15
        deductions.append(f'Very dry atmospheric air ({humidity:.1f}%)')

    score = max(10, min(100, score - (soil_penalty + temp_penalty + humidity_penalty)))

    if score >= 75:
        condition = 'GOOD'
    elif score >= 50:
        condition = 'WARNING'
    else:
        condition = 'CRITICAL'

    if deductions:
        explanation = "Field issues noted: " + ", ".join(deductions) + "."
    else:
        explanation = "Current environmental readings are within the configured monitoring ranges."

    if is_raining:
        explanation += " Active rainfall detected."

    return {
        'score': score,
        'condition': condition,
        'explanation': explanation,
        'breakdown': {
            'soil_penalty': soil_penalty,
            'temp_penalty': temp_penalty,
            'humidity_penalty': humidity_penalty,
        }
    }
