from django.conf import settings
from rest_framework.permissions import BasePermission


class HasDeviceToken(BasePermission):
    message = 'A valid IoT device token is required.'

    def has_permission(self, request, view):
        configured_token = getattr(settings, 'IOT_DEVICE_TOKEN', '')
        supplied_token = request.headers.get('X-IOT-Device-Token', '')
        return bool(configured_token and supplied_token and supplied_token == configured_token)