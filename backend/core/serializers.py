from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductReview, Cart, CartItem, Order, OrderItem, Notification, SupportArticle
from accounts.models import User
from accounts.serializers import UserSerializer
from .models import SubscriptionPlan, Subscription


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'created_at']


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'sort_order']


class ProductReviewSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'user_id', 'user_name', 'username', 'rating', 'comment', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    farmer = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    product_reviews = ProductReviewSerializer(many=True, read_only=True)
    image_urls = serializers.ListField(
        child=serializers.URLField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        source='category'
    )
    farmer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='farmer'),
        write_only=True,
        source='farmer',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'farmer',
            'farmer_id',
            'category',
            'category_id',
            'description',
            'price',
            'unit',
            'quantity_available',
            'image',
            'images',
            'image_urls',
            'product_reviews',
            'badge',
            'badge_color',
            'rating',
            'reviews',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        image_urls = validated_data.pop('image_urls', [])
        product = super().create(validated_data)

        for index, image_url in enumerate(image_urls):
            ProductImage.objects.create(
                product=product,
                image=image_url,
                sort_order=index,
            )

        return product

    def update(self, instance, validated_data):
        image_urls = validated_data.pop('image_urls', None)
        product = super().update(instance, validated_data)

        if image_urls is not None:
            product.images.all().delete()
            for index, image_url in enumerate(image_urls):
                ProductImage.objects.create(
                    product=product,
                    image=image_url,
                    sort_order=index,
                )

        return product


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        write_only=True,
        source='product'
    )
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price', 'added_at']
        read_only_fields = ['added_at']

    def get_total_price(self, obj):
        return obj.get_total_price()


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'total_items', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_total_price(self, obj):
        return obj.get_total_price()

    def get_total_items(self, obj):
        return obj.get_total_items()


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_title',
            'product_image',
            'product_unit',
            'farmer_name',
            'unit_price',
            'quantity',
            'total_price',
            'created_at',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'invoice_number',
            'payment_method',
            'payment_status',
            'payment_gateway',
            'payment_order_id',
            'payment_id',
            'payment_signature',
            'customer_name',
            'customer_email',
            'customer_phone',
            'shipping_address',
            'subtotal',
            'tax_amount',
            'delivery_fee',
            'total_amount',
            'applied_promo_code',
            'discount_amount',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = getattr(__import__('core.models', fromlist=['PromoCode']), 'PromoCode')
        fields = ['id', 'code', 'discount_type', 'value', 'active', 'expires_at', 'usage_limit', 'times_used', 'min_order_amount']
        read_only_fields = ['times_used', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    related_order_number = serializers.CharField(source='related_order.order_number', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'title',
            'message',
            'is_read',
            'related_order',
            'related_order_number',
            'created_at',
        ]
        read_only_fields = ['created_at', 'related_order_number']


class SupportArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportArticle
        fields = [
            'id',
            'category',
            'question',
            'answer',
            'is_featured',
            'sort_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'description', 'amount', 'currency', 'interval', 'razorpay_plan_id', 'active', 'features', 'recommended', 'product_limit', 'product_limit_label', 'created_at']
        read_only_fields = ['razorpay_plan_id', 'created_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'plan', 'razorpay_subscription_id', 'status', 'current_start', 'current_end', 'start_date', 'end_date', 'auto_renew', 'renewal_notified_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'plan', 'razorpay_subscription_id', 'status', 'current_start', 'current_end', 'start_date', 'end_date', 'renewal_notified_at', 'created_at', 'updated_at']
