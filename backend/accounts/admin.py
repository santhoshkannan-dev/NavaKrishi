from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
	model = User
	list_display = ('username', 'email', 'role', 'farm_name', 'phone', 'is_staff')
	list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
	fieldsets = BaseUserAdmin.fieldsets + (
		('Farmer Profile', {
			'fields': (
				'role',
				'phone',
				'farm_name',
				'farm_location',
				'farm_bio',
				'farm_logo',
				'preferred_currency',
				'unit_of_measure',
				'yield_prediction_alerts',
				'irrigation_tips_enabled',
				'order_notifications_enabled',
				'weekly_summary_emails',
			)
		}),
	)
	add_fieldsets = BaseUserAdmin.add_fieldsets + (
		('Farmer Profile', {
			'fields': (
				'role',
				'phone',
				'farm_name',
				'farm_location',
				'farm_bio',
				'farm_logo',
				'preferred_currency',
				'unit_of_measure',
				'yield_prediction_alerts',
				'irrigation_tips_enabled',
				'order_notifications_enabled',
				'weekly_summary_emails',
			)
		}),
	)