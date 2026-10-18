from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):

    CURRENCY_CHOICES = (
        ('INR', 'Indian Rupee'),
        ('USD', 'US Dollar'),
    )

    UNIT_CHOICES = (
        ('metric', 'Metric'),
        ('imperial', 'Imperial'),
    )

    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('farmer', 'Farmer'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='customer',
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    razorpay_customer_id = models.CharField(max_length=100, blank=True, default='')

    farm_name = models.CharField(max_length=255, blank=True, default='')
    farm_location = models.CharField(max_length=255, blank=True, default='')
    farm_bio = models.TextField(blank=True, default='')
    farm_logo = models.ImageField(upload_to='farm_logos/', blank=True, null=True)

    preferred_currency = models.CharField(
        max_length=10,
        choices=CURRENCY_CHOICES,
        default='INR',
    )
    unit_of_measure = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES,
        default='metric',
    )

    yield_prediction_alerts = models.BooleanField(default=True)
    irrigation_tips_enabled = models.BooleanField(default=True)
    order_notifications_enabled = models.BooleanField(default=True)
    weekly_summary_emails = models.BooleanField(default=True)

    terms_accepted = models.BooleanField(default=False)
    terms_accepted_role = models.CharField(max_length=20, blank=True, default='')
    terms_accepted_version = models.CharField(max_length=32, blank=True, default='2026-05')
    terms_accepted_at = models.DateTimeField(null=True, blank=True)

    def mark_terms_accepted(self, *, role, version='2026-05'):
        self.terms_accepted = True
        self.terms_accepted_role = role or ''
        self.terms_accepted_version = version or '2026-05'
        self.terms_accepted_at = timezone.now()


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True, default='')
    address_line1 = models.CharField(max_length=255, blank=True, default='')
    address_line2 = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    pincode = models.CharField(max_length=20, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='India')
    phone = models.CharField(max_length=20, blank=True, default='')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.label or 'Address'}"