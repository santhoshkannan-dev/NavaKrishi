from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductViewSet,
    CartViewSet,
    OrderViewSet,
    NotificationViewSet,
    SupportArticleViewSet,
    razorpay_create_order,
    razorpay_verify_payment,
    apply_promocode,
    farmer_analytics,
    subscription_plans,
    create_subscription,
    razorpay_webhook,
    test_razorpay_webhook,
    my_subscriptions,
    cancel_subscription,
    invoices_list,
    mark_order_shipped,
    bulk_mark_shipped,
)
from .assistant_views import (
    assistant_chat,
    assistant_weather,
    assistant_search,
    assistant_generate_description,
    assistant_crop_recommendation,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'support-articles', SupportArticleViewSet, basename='support-article')

urlpatterns = [
    # export via router path: /orders/farmer-orders/export/
    path('chat/', assistant_chat),
    path('assistant/chat/', assistant_chat),
    path('assistant/weather/', assistant_weather),
    path('assistant/search/', assistant_search),
    path('assistant/product-description/', assistant_generate_description),
    path('assistant/crop-recommendation/', assistant_crop_recommendation),
    path('payments/razorpay/create-order/', razorpay_create_order),
    path('payments/razorpay/verify/', razorpay_verify_payment),
    path('payments/razorpay/subscription/plans/', subscription_plans),
    path('payments/razorpay/subscription/create/', create_subscription),
    path('payments/razorpay/webhook/', razorpay_webhook),
    path('payments/razorpay/webhook/test/', test_razorpay_webhook),
    path('payments/razorpay/subscription/my/', my_subscriptions),
    path('payments/razorpay/subscription/cancel/', cancel_subscription),
    path('payments/invoices/', invoices_list),
    path('promocodes/apply/', apply_promocode),
    path('orders/farmer-analytics/', farmer_analytics),
    path('orders/<int:order_id>/mark-shipped/', mark_order_shipped),
    path('orders/bulk-mark-shipped/', bulk_mark_shipped),
    path('', include(router.urls)),
]
