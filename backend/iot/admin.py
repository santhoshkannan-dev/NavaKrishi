from django.contrib import admin

from .models import SensorData


@admin.register(SensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display = ('temperature', 'humidity', 'soil_moisture', 'rain_detected', 'pump_status', 'created_at')
    list_filter = ('rain_detected', 'pump_status', 'created_at')
    ordering = ('-created_at',)
