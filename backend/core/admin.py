from django.contrib import admin
from .models import Category, Product, ProductImage, ProductReview, Cart, CartItem, Order, OrderItem, Notification, SupportArticle
from .models import SubscriptionPlan, Subscription
from .models import EmailTemplate, WebhookLog


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'sort_order')
    ordering = ('sort_order',)


class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    extra = 0
    fields = ('user', 'rating', 'comment', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_at',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'farmer', 'category', 'price', 'quantity_available', 'rating', 'is_active', 'created_at')
    list_filter = ('is_active', 'category', 'created_at')
    search_fields = ('title', 'description', 'farmer__username')
    readonly_fields = ('created_at', 'updated_at', 'rating', 'reviews')
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'farmer', 'category', 'description')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'unit', 'quantity_available')
        }),
        ('Presentation', {
            'fields': ('image', 'badge', 'badge_color')
        }),
        ('Ratings', {
            'fields': ('rating', 'reviews')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [ProductImageInline, ProductReviewInline]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_total_items', 'get_total_price', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'get_total_price', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('cart__user__username', 'product__title')
    readonly_fields = ('added_at',)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ('product_title', 'quantity', 'unit_price', 'total_price')
    readonly_fields = ('product_title', 'quantity', 'unit_price', 'total_price')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'payment_status', 'payment_gateway', 'total_amount', 'created_at')
    list_filter = ('payment_status', 'payment_gateway', 'created_at')
    search_fields = ('order_number', 'invoice_number', 'payment_id', 'payment_order_id', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'order_number', 'invoice_number')
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product_title', 'quantity', 'unit_price', 'total_price')
    search_fields = ('order__order_number', 'product_title', 'farmer_name')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__username', 'user__email')
    readonly_fields = ('created_at',)


@admin.register(SupportArticle)
class SupportArticleAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'is_featured', 'is_published', 'sort_order', 'updated_at')
    list_filter = ('category', 'is_featured', 'is_published')
    search_fields = ('question', 'answer', 'category')
    list_editable = ('is_featured', 'is_published', 'sort_order')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'currency', 'interval', 'recommended', 'razorpay_plan_id', 'active', 'created_at')
    search_fields = ('name', 'razorpay_plan_id')
    readonly_fields = ('created_at',)
    list_filter = ('recommended', 'active', 'interval')
    fieldsets = (
        (None, {'fields': ('name', 'description', 'amount', 'currency', 'interval', 'recommended', 'active')}),
        ('Razorpay', {'fields': ('razorpay_plan_id',)}),
        ('Features', {'fields': ('features',)}),
        ('Timestamps', {'fields': ('created_at',), 'classes': ('collapse',)}),
    )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('razorpay_subscription_id', 'user', 'plan', 'status', 'current_start', 'current_end', 'created_at')
    search_fields = ('razorpay_subscription_id', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_at',)


@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display = ('event', 'processed', 'received_at')
    search_fields = ('event', 'payload')
    readonly_fields = ('received_at',)
    ordering = ('-received_at',)
