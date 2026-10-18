from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User
from uuid import uuid4
from decimal import Decimal


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Icon name or emoji
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    title = models.CharField(max_length=200)
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', limit_choices_to={'role': 'farmer'})
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, default='piece')  # e.g., 'lb', 'kg', 'oz', 'pk'
    quantity_available = models.IntegerField(validators=[MinValueValidator(0)])
    image = models.URLField(blank=True)
    badge = models.CharField(max_length=100, blank=True)  # e.g., 'Organic Certified'
    badge_color = models.CharField(max_length=50, blank=True)  # e.g., 'bg-[#dff5d8] text-[#267320]'
    rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    reviews = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.farmer.username}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.URLField()
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"Image {self.id} for {self.product.title}"


class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='product_reviews')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.title} review by {self.user.username}"


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

    def get_total_price(self):
        return sum((item.get_total_price() for item in self.items.all()), Decimal('0.00'))

    def get_total_items(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity} x {self.product.title}"

    def get_total_price(self):
        return Decimal(str(self.product.price)) * self.quantity


class Order(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('razorpay', 'Razorpay'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=32, unique=True, blank=True)
    invoice_number = models.CharField(max_length=32, unique=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='razorpay')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='paid')
    payment_gateway = models.CharField(max_length=50, default='Razorpay')
    payment_order_id = models.CharField(max_length=100, unique=True)
    payment_id = models.CharField(max_length=100, unique=True)
    payment_signature = models.CharField(max_length=255, blank=True, default='')
    customer_name = models.CharField(max_length=200, blank=True, default='')
    customer_email = models.EmailField(blank=True, default='')
    customer_phone = models.CharField(max_length=20, blank=True, default='')
    shipping_address = models.JSONField(default=dict, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    applied_promo_code = models.CharField(max_length=64, blank=True, default='')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number or self.id} - {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"NK-{uuid4().hex[:10].upper()}"

        if not self.invoice_number:
            self.invoice_number = f"INV-{uuid4().hex[:10].upper()}"

        super().save(*args, **kwargs)


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = (
        ('order', 'Order'),
        ('promo', 'Promo'),
        ('system', 'System'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=16, choices=NOTIFICATION_TYPE_CHOICES, default='system')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} for {self.user.username}"


class SupportArticle(models.Model):
    category = models.CharField(max_length=120)
    question = models.CharField(max_length=255)
    answer = models.TextField()
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return f"{self.category}: {self.question}"


class PredictionSimulation(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prediction_simulations')
    scenario_name = models.CharField(max_length=120, default='Untitled simulation')
    season = models.CharField(max_length=20)
    expected_rainfall = models.FloatField()
    min_temperature = models.FloatField()
    max_temperature = models.FloatField()
    soil_ph = models.FloatField()
    results = models.JSONField()
    model_version = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['owner', '-created_at'])]

    def __str__(self):
        return f'{self.scenario_name} for {self.owner.username}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    product_title = models.CharField(max_length=200)
    product_image = models.URLField(blank=True, default='')
    product_unit = models.CharField(max_length=50, blank=True, default='item')
    farmer_name = models.CharField(max_length=200, blank=True, default='')
    is_shipped = models.BooleanField(default=False)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity} x {self.product_title}"


class PromoCode(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ('percent', 'Percentage'),
        ('fixed', 'Fixed Amount'),
        ('shipping', 'Free Shipping'),
    )

    code = models.CharField(max_length=64, unique=True)
    discount_type = models.CharField(max_length=16, choices=DISCOUNT_TYPE_CHOICES, default='percent')
    value = models.DecimalField(max_digits=8, decimal_places=2, help_text='Percentage (0-100) or fixed amount')
    active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text='Max times this code can be used (null = unlimited)')
    times_used = models.PositiveIntegerField(default=0)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code


class SubscriptionPlan(models.Model):
    """Represents a subscription plan offered in the app.
    Amount is stored in rupees (Decimal) and interval is one of 'monthly' or 'yearly'.
    """
    INTERVAL_CHOICES = (
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    )

    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    interval = models.CharField(max_length=16, choices=INTERVAL_CHOICES, default='monthly')
    razorpay_plan_id = models.CharField(max_length=128, blank=True, null=True)
    active = models.BooleanField(default=True)
    features = models.JSONField(blank=True, default=list, help_text='List of feature strings')
    recommended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.amount} {self.currency}/{self.interval})"

    @property
    def product_limit(self):
        """Maximum products allowed for this plan."""
        name = (self.name or '').strip().lower()
        if 'basic' in name:
            return 50
        if 'pro' in name:
            return 200
        if 'premium' in name:
            return 500
        return 50

    @property
    def product_limit_label(self):
        limit = self.product_limit
        return f'{limit} products'


class Subscription(models.Model):
    STATUS_CHOICES = (
        ('created', 'Created'),
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('past_due', 'Past Due'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True, related_name='subscriptions')
    razorpay_subscription_id = models.CharField(max_length=128, unique=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='created')
    current_start = models.DateTimeField(null=True, blank=True)
    current_end = models.DateTimeField(null=True, blank=True)
    # Convenient aliases: start/end of the active billing period
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    # If true, the subscription will be automatically renewed when end_date passes
    auto_renew = models.BooleanField(default=False)
    # Track when the user was last notified about upcoming renewal
    renewal_notified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Subscription {self.razorpay_subscription_id} for {self.user.username} ({self.status})"


class EmailTemplate(models.Model):
    """Simple email templates stored in the DB for admin-editable emails."""
    name = models.CharField(max_length=120, unique=True)
    subject = models.CharField(max_length=255)
    body = models.TextField(help_text='Use {username}, {plan}, {status} placeholders')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class WebhookLog(models.Model):
    event = models.CharField(max_length=255)
    payload = models.JSONField()
    headers = models.TextField(blank=True, default='')
    signature = models.CharField(max_length=255, blank=True, default='')
    processed = models.BooleanField(default=False)
    response = models.TextField(blank=True, default='')
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-received_at']

    def __str__(self):
        return f"Webhook {self.event} @ {self.received_at.isoformat()}"
