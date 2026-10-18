from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import login_user, register_user, change_password
from .views import profile, addresses_list_create, address_detail


urlpatterns = [
    path('register/', register_user),
    path('login/', login_user),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('change-password/', change_password),
    path('profile/', profile),
    path('addresses/', addresses_list_create),
    path('addresses/<int:pk>/', address_detail),
]