from rest_framework import serializers
from .models import SensorData, Notification, Alert, PumpCommand


class SensorDataSerializer(serializers.ModelSerializer):
    is_raining = serializers.BooleanField(source='rain_detected', required=False)

    class Meta:
        model = SensorData
        fields = [
            'id',
            'soil_moisture',
            'temperature',
            'humidity',
            'rain_detected',
            'is_raining',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_soil_moisture(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Soil moisture must be between 0% and 100%.")
        return value

    def validate_humidity(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Humidity must be between 0% and 100%.")
        return value

    def validate_temperature(self, value):
        if value < -40 or value > 80:
            raise serializers.ValidationError("Temperature is out of valid bounds (-40°C to 80°C).")
        return round(float(value), 2)


class NotificationSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='notification_type')

    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'notification_type',
            'level',
            'title',
            'message',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'


class PumpCommandSerializer(serializers.ModelSerializer):
    class Meta:
        model = PumpCommand
        fields = ['id', 'manual_mode', 'pump_on', 'created_at']
