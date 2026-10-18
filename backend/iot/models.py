from django.db import models


class SensorData(models.Model):
    temperature = models.FloatField()
    humidity = models.FloatField()
    soil_moisture = models.IntegerField()
    rain_detected = models.BooleanField()
    pump_status = models.BooleanField(default=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        rain = "Rain" if self.rain_detected else "No Rain"
        return f"{self.temperature}°C | {self.soil_moisture}% | {rain} ({self.created_at.strftime('%H:%M:%S')})"


class Notification(models.Model):
    TYPE_CHOICES = [
        ("soil", "Soil"),
        ("temperature", "Temperature"),
        ("humidity", "Humidity"),
        ("rain", "Rain"),
        ("system", "System"),
    ]

    LEVEL_CHOICES = [
        ("info", "Info"),
        ("warning", "Warning"),
        ("critical", "Critical"),
        ("success", "Success"),
    ]

    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.level.upper()}] {self.title} ({self.created_at.strftime('%H:%M:%S')})"


class Alert(models.Model):
    """Preserved for backward-compatibility with earlier API contracts."""
    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]

    alert_type = models.CharField(max_length=50)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info')
    title = models.CharField(max_length=200)
    message = models.TextField()
    sensor_value = models.FloatField(null=True, blank=True)
    threshold = models.FloatField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity.upper()}] {self.title} ({self.created_at.strftime('%H:%M:%S')})"


class PumpCommand(models.Model):
    manual_mode = models.BooleanField(default=False)
    pump_on = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        mode = 'manual' if self.manual_mode else 'auto'
        state = 'on' if self.pump_on else 'off'
        return f'Pump {state} ({mode})'
