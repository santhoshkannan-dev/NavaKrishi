import base64
import hashlib
import hmac
import json
import os
import urllib.error
import urllib.request
from decimal import Decimal
import logging

from django.conf import settings
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db.models import Avg, Count, Sum
from django.http import HttpResponse
import csv
from django.core.mail import send_mail
from django.conf import settings as dj_settings

from .models import Category, Product, ProductReview, Cart, CartItem, Order, OrderItem, PromoCode, Notification, SupportArticle
from .models import SubscriptionPlan, Subscription
from django.db.models.functions import TruncMonth
from django.utils import timezone
from .serializers import CategorySerializer, ProductSerializer, CartSerializer, CartItemSerializer, OrderSerializer, NotificationSerializer, SupportArticleSerializer
from .serializers import SubscriptionPlanSerializer, SubscriptionSerializer
from asgiref.sync import async_to_sync
try:
    from channels.layers import get_channel_layer  # type: ignore
except Exception:
    # channels may not be installed in some environments (linting/dev).
    # Provide a noop fallback to keep runtime safe and suppress Pylance errors.
    get_channel_layer = None

GST_RATE = Decimal('0.05')
DELIVERY_FEE = Decimal('50.00')

PLAN_PRODUCT_LIMITS = {
    'basic': 50,
    'pro': 200,
    'premium': 500,
}

logger = logging.getLogger(__name__)


def _subscription_plan_product_limit(plan):
    if not plan:
        return None

    name = (plan.name or '').strip().lower()
    return PLAN_PRODUCT_LIMITS.get(name, 50)


def _get_active_subscription_for_user(user):
    return (
        Subscription.objects
        .select_related('plan')
        .filter(user=user, status__in=['active', 'created'])
        .order_by('-created_at')
        .first()
    )


def _notify_user(user, *, notification_type='system', title='', message='', related_order=None):
    try:
        Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            related_order=related_order,
        )
    except Exception:
        logger.exception('Failed to create notification: %s', title)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for categories.
    List all categories or retrieve a single category.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for products.
    Supports listing, retrieving, creating, updating, and deleting products.
    Farmers can manage their own products, customers can view all active products.
    """
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy', 'my_products', 'add_to_cart', 'add_review'}:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__id=category)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Search by title or description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        # Filter by farmer
        farmer = self.request.query_params.get('farmer', None)
        if farmer:
            queryset = queryset.filter(farmer__id=farmer)
        
        # Only show active products for non-farmers
        if not self.request.user.is_authenticated or getattr(self.request.user, 'role', None) != 'farmer':
            queryset = queryset.filter(is_active=True)
        
        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            self.perform_create(serializer)
        except ValueError as error:
            return Response({'detail': str(error)}, status=status.HTTP_403_FORBIDDEN)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        farmer = self.request.user
        current_subscription = _get_active_subscription_for_user(farmer)

        if not current_subscription or not current_subscription.plan:
            raise ValueError('Please purchase a subscription plan before adding products.')

        product_limit = _subscription_plan_product_limit(current_subscription.plan)
        if product_limit is not None:
            current_count = Product.objects.filter(farmer=farmer).count()
            if current_count >= product_limit:
                raise ValueError(
                    f'Your {current_subscription.plan.name} plan allows up to {product_limit} products. Upgrade to add more.'
                )

        product = serializer.save(farmer=farmer)
        _notify_user(
            farmer,
            notification_type='system',
            title='Product added successfully',
            message=f'Your product "{product.title}" has been added to the marketplace.',
        )

    def update(self, request, *args, **kwargs):
        product = self.get_object()
        if product.farmer != request.user:
            return Response(
                {'detail': 'You do not have permission to update this product.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        if product.farmer != request.user:
            return Response(
                {'detail': 'You do not have permission to delete this product.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_products(self, request):
        """Get products posted by the current farmer."""
        if request.user.role != 'farmer':
            return Response(
                {'detail': 'Only farmers can access this endpoint.'},
                status=status.HTTP_403_FORBIDDEN
            )
        products = Product.objects.filter(farmer=request.user)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_to_cart(self, request, pk=None):
        """Add product to cart."""
        product = self.get_object()
        quantity = request.data.get('quantity', 1)
        
        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response(
                    {'detail': 'Quantity must be at least 1.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'detail': 'Invalid quantity.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response(
            {'detail': 'Product added to cart.', 'cart': CartSerializer(cart).data},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        """Add or update a review for a product by the current user."""
        product = self.get_object()
        rating = request.data.get('rating')
        comment = request.data.get('comment', '').strip()

        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                return Response(
                    {'detail': 'Rating must be between 1 and 5.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'detail': 'Invalid rating.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not comment:
            return Response(
                {'detail': 'Comment is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ProductReview.objects.update_or_create(
            product=product,
            user=request.user,
            defaults={'rating': rating, 'comment': comment}
        )

        review_stats = product.product_reviews.aggregate(avg_rating=Avg('rating'))
        product.rating = round(review_stats['avg_rating'] or 0, 1)
        product.reviews = product.product_reviews.count()
        product.save(update_fields=['rating', 'reviews', 'updated_at'])

        serializer = self.get_serializer(product)
        return Response(
            {'detail': 'Review submitted successfully.', 'product': serializer.data},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_review(self, request, pk=None):
        """Delete the current user's review for the product."""
        product = self.get_object()
        review = ProductReview.objects.filter(product=product, user=request.user).first()
        if not review:
            return Response({'detail': 'Review not found.'}, status=status.HTTP_404_NOT_FOUND)

        review.delete()

        # Recalculate aggregates
        review_stats = product.product_reviews.aggregate(avg_rating=Avg('rating'))
        product.rating = round(review_stats['avg_rating'] or 0, 1)
        product.reviews = product.product_reviews.count()
        product.save(update_fields=['rating', 'reviews', 'updated_at'])

        serializer = self.get_serializer(product)
        return Response({'detail': 'Review deleted.', 'product': serializer.data})


class CartViewSet(viewsets.ViewSet):
    """
    API endpoint for shopping carts.
    Users can view and manage their own cart.
    """
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'], url_path='my-cart')
    def my_cart(self, request):
        """Get the current user's cart."""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='add-item')
    def add_item(self, request):
        """Add an item to the cart."""
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        if not product_id:
            return Response(
                {'detail': 'product_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response(
                    {'detail': 'Quantity must be at least 1.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'detail': 'Invalid quantity.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(Product, id=product_id)
        # enforce available stock when adding to cart
        if quantity > product.quantity_available:
            return Response(
                {'detail': f'Only {product.quantity_available} item(s) available.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            new_qty = cart_item.quantity + quantity
            if new_qty > product.quantity_available:
                return Response(
                    {'detail': f'Only {product.quantity_available} item(s) available.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.quantity = new_qty
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='update-item')
    def update_item(self, request):
        """Update quantity of an item in the cart."""
        cart_item_id = request.data.get('cart_item_id')
        quantity = request.data.get('quantity')

        if not cart_item_id or quantity is None:
            return Response(
                {'detail': 'cart_item_id and quantity are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response(
                    {'detail': 'Quantity must be at least 1.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'detail': 'Invalid quantity.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item = get_object_or_404(CartItem, id=cart_item_id, cart__user=request.user)
        # ensure we don't set cart quantity beyond available stock
        product = cart_item.product
        if quantity > product.quantity_available:
            return Response(
                {'detail': f'Only {product.quantity_available} item(s) available.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart_item.cart)
        return Response(serializer.data)


@api_view(['GET'])
def farmer_analytics(request):
    if not request.user or not request.user.is_authenticated:
        return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
    if getattr(request.user, 'role', None) != 'farmer':
        return Response({'detail': 'Only farmers can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

    # Aggregates
    qs_items = OrderItem.objects.filter(product__farmer=request.user)
    total_revenue = qs_items.aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
    total_items = qs_items.aggregate(total_qty=Sum('quantity'))['total_qty'] or 0
    total_orders_qs = (
        Order.objects.filter(items__product__farmer=request.user).distinct()
    )
    total_orders = total_orders_qs.count()

    avg_order_value = (total_revenue / total_orders) if total_orders else Decimal('0.00')

    # Monthly revenue (last 12 months)
    monthly_qs = (
        Order.objects
        .filter(items__product__farmer=request.user)
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(revenue=Sum('total_amount'))
        .order_by('month')
    )
    monthly = []
    for row in monthly_qs:
        m = row.get('month')
        monthly.append({'label': m.strftime('%b %Y') if m else '', 'value': float(row.get('revenue') or 0)})

    # Category / SKU totals
    cat_qs = (
        qs_items
        .values('product__title')
        .annotate(total=Sum('total_price'))
        .order_by('-total')[:10]
    )
    categories = []
    cat_sum = 0
    for r in cat_qs:
        cat_sum += float(r.get('total') or 0)
    for r in cat_qs:
        name = r.get('product__title') or 'Other'
        total = float(r.get('total') or 0)
        pct = int(round((total / (cat_sum or 1)) * 100))
        categories.append({'name': name, 'value': f"{pct}%", 'width': f"{pct}%"})

    # Recent orders
    recent_qs = (
        Order.objects
        .filter(items__product__farmer=request.user)
        .prefetch_related('items__product')
        .order_by('-created_at')[:10]
    )
    recent = []
    for o in recent_qs:
        first_item = (o.items.all()[0] if o.items.exists() else None)
        recent.append({
            'id': o.id,
            'product': first_item.product_title if first_item else '—',
            'customer': o.customer_name or 'Customer',
            'date': o.created_at.isoformat(),
            'amount': float(o.total_amount or 0),
            'status': o.payment_status,
        })

    # Customer insights (simple heuristics)
    unique_customers = (
        Order.objects.filter(items__product__farmer=request.user).values('customer_email').distinct().count()
    )
    repeat_customers = (
        Order.objects
        .filter(items__product__farmer=request.user)
        .values('customer_email')
        .annotate(cnt=Count('id'))
        .filter(cnt__gt=1)
        .count()
    )
    retention_rate = int(round((repeat_customers / (unique_customers or 1)) * 100))

    # yield efficiency placeholder (can be replaced by real metrics)
    yield_efficiency = {'ai_adoption_percent': 65, 'net_profit_increase_percent': 24}

    return Response({
        'aggregates': {
            'total_revenue': float(total_revenue),
            'total_items': int(total_items),
            'total_orders': int(total_orders),
            'avg_order_value': float(avg_order_value),
        },
        'monthly': monthly,
        'categories': categories,
        'recent': recent,
        'customer_insights': {
            'unique_customers': unique_customers,
            'repeat_customers': repeat_customers,
            'retention_rate_percent': retention_rate,
        },
        'yield_efficiency': yield_efficiency,
    })

    @action(detail=False, methods=['post'], url_path='remove-item')
    def remove_item(self, request):
        """Remove an item from the cart."""
        cart_item_id = request.data.get('cart_item_id')

        if not cart_item_id:
            return Response(
                {'detail': 'cart_item_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item = get_object_or_404(CartItem, id=cart_item_id, cart__user=request.user)
        cart = cart_item.cart
        cart_item.delete()

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='clear')
    def clear_cart(self, request):
        """Clear all items from the cart."""
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product').order_by('-created_at')

    @action(detail=False, methods=['get'])
    def latest(self, request):
        order = self.get_queryset().first()
        if not order:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='farmer-orders')
    def farmer_orders(self, request):
        if getattr(request.user, 'role', None) != 'farmer':
            return Response(
                {'detail': 'Only farmers can access this endpoint.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        payment_status = (request.query_params.get('payment_status') or '').strip().lower()
        search = (request.query_params.get('search') or '').strip()
        order_ids_raw = (request.query_params.get('order_ids') or '').strip()
        sort_by = (request.query_params.get('sort_by') or '').strip()
        sort_dir = (request.query_params.get('sort_dir') or 'desc').strip().lower()
        raw_page = request.query_params.get('page', 1)
        raw_page_size = request.query_params.get('page_size', 10)

        try:
            page = max(int(raw_page), 1)
        except (TypeError, ValueError):
            page = 1

        try:
            page_size = int(raw_page_size)
        except (TypeError, ValueError):
            page_size = 10
        page_size = min(max(page_size, 1), 50)

        base_queryset = (
            Order.objects
            .filter(items__product__farmer=request.user)
            .order_by('-created_at')
            .distinct()
        )

        status_counts = {'all': base_queryset.count(), 'paid': 0, 'pending': 0, 'failed': 0}
        for row in base_queryset.values('payment_status').annotate(total=Count('id', distinct=True)):
            key = str(row.get('payment_status') or '').lower()
            if key in status_counts:
                status_counts[key] = row.get('total') or 0

        queryset = base_queryset

        if search:
            queryset = queryset.filter(
                Q(order_number__icontains=search)
                | Q(invoice_number__icontains=search)
                | Q(customer_name__icontains=search)
                | Q(customer_email__icontains=search)
            )

        # sorting
        if sort_by:
            allowed = {'created_at', 'total_amount', 'subtotal', 'customer_name', 'order_number', 'invoice_number'}
            if sort_by not in allowed:
                sort_by = 'created_at'

            prefix = '' if sort_dir == 'asc' else '-'
            queryset = queryset.order_by(prefix + sort_by)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        total_count = queryset.count()
        total_pages = max((total_count + page_size - 1) // page_size, 1)
        start = (page - 1) * page_size
        end = start + page_size

        page_queryset = queryset.prefetch_related('items__product')[start:end]

        farmer_name_candidates = {
            (request.user.get_full_name() or '').strip(),
            (request.user.username or '').strip(),
        }
        farmer_name_candidates.discard('')

        farmer_orders = []
        for order in page_queryset:
            scoped_items = []
            for item in order.items.all():
                is_farmer_product = item.product and item.product.farmer_id == request.user.id
                is_legacy_match = (not item.product) and (item.farmer_name in farmer_name_candidates)
                if not (is_farmer_product or is_legacy_match):
                    continue

                scoped_items.append(
                    {
                        'id': item.id,
                        'product_id': item.product_id,
                        'product_title': item.product_title,
                        'product_image': item.product_image,
                        'product_unit': item.product_unit,
                        'farmer_name': item.farmer_name,
                        'is_shipped': item.is_shipped,
                        'unit_price': item.unit_price,
                        'quantity': item.quantity,
                        'total_price': item.total_price,
                        'created_at': item.created_at,
                    }
                )

            if not scoped_items:
                continue

            farmer_subtotal = sum((item['total_price'] for item in scoped_items), Decimal('0.00'))
            farmer_total_items = sum(item['quantity'] for item in scoped_items)

            farmer_orders.append(
                {
                    'id': order.id,
                    'order_number': order.order_number,
                    'invoice_number': order.invoice_number,
                    'payment_status': order.payment_status,
                    'payment_method': order.payment_method,
                    'customer_name': order.customer_name,
                    'customer_email': order.customer_email,
                    'customer_phone': order.customer_phone,
                    'shipping_address': order.shipping_address,
                    'full_order_total': order.total_amount,
                    'farmer_subtotal': farmer_subtotal,
                    'farmer_total_amount': farmer_subtotal,
                    'farmer_total_items': farmer_total_items,
                    'created_at': order.created_at,
                    'updated_at': order.updated_at,
                    'items': scoped_items,
                }
            )

        # global aggregates across all order items for this farmer
        aggregates = (
            OrderItem.objects.filter(product__farmer=request.user)
            .aggregate(total_items=Sum('quantity'), total_revenue=Sum('total_price'))
        )

        return Response(
            {
                'count': total_count,
                'total_pages': total_pages,
                'page': page,
                'page_size': page_size,
                'status_counts': status_counts,
                'aggregates': {
                    'total_items': int(aggregates.get('total_items') or 0),
                    'total_revenue': str(aggregates.get('total_revenue') or 0),
                },
                'results': farmer_orders,
            }
        )

    @action(detail=False, methods=['get'], url_path='farmer-orders/export')
    def export_farmer_orders(self, request):
        """Export farmer-scoped orders as CSV for current farmer (applies same filters)."""
        if getattr(request.user, 'role', None) != 'farmer':
            return Response({'detail': 'Only farmers can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        payment_status = (request.query_params.get('payment_status') or '').strip().lower()
        search = (request.query_params.get('search') or '').strip()
        order_ids_raw = (request.query_params.get('order_ids') or '').strip()

        queryset = (
            Order.objects
            .filter(items__product__farmer=request.user)
            .prefetch_related('items__product')
            .order_by('-created_at')
            .distinct()
        )

        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        if search:
            queryset = queryset.filter(
                Q(order_number__icontains=search)
                | Q(invoice_number__icontains=search)
                | Q(customer_name__icontains=search)
            )

        if order_ids_raw:
            try:
                ids = [int(x) for x in order_ids_raw.split(',') if x.strip()]
                if ids:
                    queryset = queryset.filter(id__in=ids)
            except Exception:
                pass

        # Build CSV
        rows = []
        header = ['order_number', 'invoice_number', 'created_at', 'customer_name', 'customer_email', 'item_product_title', 'item_quantity', 'item_unit_price', 'item_total_price', 'is_shipped']

        for order in queryset:
            for item in order.items.all():
                # only farmer items
                if not item.product or item.product.farmer_id != request.user.id:
                    continue

                rows.append([
                    order.order_number,
                    order.invoice_number,
                    order.created_at.isoformat(),
                    order.customer_name,
                    order.customer_email,
                    item.product_title,
                    item.quantity,
                    str(item.unit_price),
                    str(item.total_price),
                    str(bool(item.is_shipped)),
                ])

        # stream CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="farmer_orders.csv"'

        writer = csv.writer(response)
        writer.writerow(header)
        for r in rows:
            writer.writerow(r)

        return response


    @api_view(['GET'])
    def farmer_analytics(request):
        if getattr(request.user, 'role', None) != 'farmer':
            return Response({'detail': 'Only farmers can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        # Aggregates
        qs_items = OrderItem.objects.filter(product__farmer=request.user)
        total_revenue = qs_items.aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
        total_items = qs_items.aggregate(total_qty=Sum('quantity'))['total_qty'] or 0
        total_orders_qs = (
            Order.objects.filter(items__product__farmer=request.user).distinct()
        )
        total_orders = total_orders_qs.count()

        avg_order_value = (total_revenue / total_orders) if total_orders else Decimal('0.00')

        # Monthly revenue (last 12 months)
        monthly_qs = (
            Order.objects
            .filter(items__product__farmer=request.user)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total_amount'))
            .order_by('month')
        )
        monthly = []
        for row in monthly_qs:
            m = row.get('month')
            monthly.append({'label': m.strftime('%b %Y') if m else '', 'value': float(row.get('revenue') or 0)})

        # Category / SKU totals
        cat_qs = (
            qs_items
            .values('product__title')
            .annotate(total=Sum('total_price'))
            .order_by('-total')[:10]
        )
        categories = []
        cat_sum = 0
        for r in cat_qs:
            cat_sum += float(r.get('total') or 0)
        for r in cat_qs:
            name = r.get('product__title') or 'Other'
            total = float(r.get('total') or 0)
            pct = int(round((total / (cat_sum or 1)) * 100))
            categories.append({'name': name, 'value': f"{pct}%", 'width': f"{pct}%"})

        # Recent orders
        recent_qs = (
            Order.objects
            .filter(items__product__farmer=request.user)
            .prefetch_related('items__product')
            .order_by('-created_at')[:10]
        )
        recent = []
        for o in recent_qs:
            first_item = (o.items.all()[0] if o.items.exists() else None)
            recent.append({
                'id': o.id,
                'product': first_item.product_title if first_item else '—',
                'customer': o.customer_name or 'Customer',
                'date': o.created_at.isoformat(),
                'amount': float(o.total_amount or 0),
                'status': o.payment_status,
            })

        # Customer insights (simple heuristics)
        unique_customers = (
            Order.objects.filter(items__product__farmer=request.user).values('customer_email').distinct().count()
        )
        repeat_customers = (
            Order.objects
            .filter(items__product__farmer=request.user)
            .values('customer_email')
            .annotate(cnt=Count('id'))
            .filter(cnt__gt=1)
            .count()
        )
        retention_rate = int(round((repeat_customers / (unique_customers or 1)) * 100))

        # yield efficiency placeholder (can be replaced by real metrics)
        yield_efficiency = {'ai_adoption_percent': 65, 'net_profit_increase_percent': 24}

        return Response({
            'aggregates': {
                'total_revenue': float(total_revenue),
                'total_items': int(total_items),
                'total_orders': int(total_orders),
                'avg_order_value': float(avg_order_value),
            },
            'monthly': monthly,
            'categories': categories,
            'recent': recent,
            'customer_insights': {
                'unique_customers': unique_customers,
                'repeat_customers': repeat_customers,
                'retention_rate_percent': retention_rate,
            },
            'yield_efficiency': yield_efficiency,
        })

    @action(detail=False, methods=['get'], url_path='farmer-routes')
    def farmer_routes(self, request):
        """Return simple suggested routes grouped by shipping pincode/city for the current farmer."""
        if getattr(request.user, 'role', None) != 'farmer':
            return Response({'detail': 'Only farmers can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = (
            Order.objects
            .filter(items__product__farmer=request.user)
            .prefetch_related('items__product')
            .order_by('-created_at')
            .distinct()
        )

        groups = {}
        for order in queryset:
            addr = order.shipping_address or {}
            key = str(addr.get('pincode') or addr.get('city') or 'unknown')
            if key not in groups:
                groups[key] = {
                    'key': key,
                    'label': addr.get('pincode') or addr.get('city') or 'Unknown',
                    'order_ids': [],
                    'stops': 0,
                    'total_items': 0,
                    'addresses': [],
                }

            groups[key]['order_ids'].append(order.id)
            groups[key]['stops'] = len(groups[key]['order_ids'])

            # count items that belong to this farmer for this order
            farmer_items = 0
            for item in order.items.all():
                if item.product and getattr(item.product, 'farmer_id', None) == request.user.id:
                    farmer_items += item.quantity

            groups[key]['total_items'] += farmer_items
            # append a formatted address for this order (limit to 10 addresses per group)
            try:
                parts = [addr.get('address_line1') or addr.get('address') or '', addr.get('city') or '', addr.get('state') or '', addr.get('pincode') or '']
                formatted = ', '.join([p for p in parts if p])
                if formatted and len(groups[key]['addresses']) < 10:
                    groups[key]['addresses'].append(formatted)
            except Exception:
                # ignore malformed address
                pass

        return Response({'routes': list(groups.values())})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_order_shipped(request, order_id):
    """Mark all order items that belong to the current farmer as shipped for the given order."""
    if getattr(request.user, 'role', None) != 'farmer':
        return Response({'detail': 'Only farmers can perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        order = Order.objects.prefetch_related('items__product').get(id=order_id)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

    changed = 0
    for item in order.items.all():
        if item.product and getattr(item.product, 'farmer_id', None) == request.user.id:
            if not item.is_shipped:
                item.is_shipped = True
                item.save(update_fields=['is_shipped'])
                changed += 1

    # Notify via channels that order items were updated for this farmer
    if changed:
        if get_channel_layer:
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f'farmer_{request.user.id}',
                    {'type': 'order.update', 'order_id': order.id, 'action': 'marked_shipped'},
                )
            except Exception:
                logger.exception('Failed to send channel notification for mark_shipped')

    return Response({'detail': 'Marked shipped', 'changed': changed})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_mark_shipped(request):
    """Mark farmer-owned items as shipped for multiple orders.
    Expects JSON: {"order_ids": [1,2,3]}
    Returns: {changed: <int>, per_order: {order_id: changed_count}}
    """
    if getattr(request.user, 'role', None) != 'farmer':
        return Response({'detail': 'Only farmers can perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    order_ids = request.data.get('order_ids') or []
    if not isinstance(order_ids, (list, tuple)):
        return Response({'detail': 'order_ids must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

    total_changed = 0
    per_order = {}
    for oid in order_ids:
        try:
            order = Order.objects.prefetch_related('items__product').get(id=oid)
        except Order.DoesNotExist:
            per_order[str(oid)] = 0
            continue

        changed = 0
        for item in order.items.all():
            if item.product and getattr(item.product, 'farmer_id', None) == request.user.id:
                if not item.is_shipped:
                    item.is_shipped = True
                    item.save(update_fields=['is_shipped'])
                    changed += 1

        if changed:
            if get_channel_layer:
                try:
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        f'farmer_{request.user.id}',
                        {'type': 'order.update', 'order_id': order.id, 'action': 'marked_shipped'},
                    )
                except Exception:
                    logger.exception('Failed to send channel notification for bulk_mark_shipped')

        per_order[str(oid)] = changed
        total_changed += changed

    return Response({'changed': total_changed, 'per_order': per_order})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def invoices_list(request):
    """Return detailed billing history (invoices) for the current user."""
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        return Response({'count': self.get_queryset().filter(is_read=False).count()})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read.'})


class SupportArticleViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = SupportArticleSerializer

    def get_queryset(self):
        queryset = SupportArticle.objects.filter(is_published=True)

        search = (self.request.query_params.get('search') or '').strip()
        if search:
            queryset = queryset.filter(
                Q(category__icontains=search)
                | Q(question__icontains=search)
                | Q(answer__icontains=search)
            )

        category = (self.request.query_params.get('category') or '').strip()
        if category:
            queryset = queryset.filter(category__iexact=category)

        featured = self.request.query_params.get('featured')
        if featured is not None:
            featured_bool = str(featured).strip().lower() in {'1', 'true', 'yes'}
            queryset = queryset.filter(is_featured=featured_bool)

        return queryset


def _normalize_shipping_address(data):
    if not isinstance(data, dict):
        return {}

    return {
        'label': data.get('label', ''),
        'address': data.get('address', ''),
        'address_line1': data.get('address_line1', ''),
        'address_line2': data.get('address_line2', ''),
        'city': data.get('city', ''),
        'state': data.get('state', ''),
        'pincode': data.get('pincode', ''),
        'country': data.get('country', 'India'),
        'phone': data.get('phone', ''),
    }


def _build_order_from_cart(*, user, payment_order_id, payment_id, payment_signature, shipping_address, customer_name, customer_email, customer_phone, promo_code=None, discount_amount=Decimal('0.00')):
    cart = Cart.objects.get_or_create(user=user)[0]
    cart_items = list(cart.items.select_related('product', 'product__farmer').all())

    if not cart_items:
        raise ValueError('Your cart is empty.')

    subtotal = Decimal(str(cart.get_total_price()))
    tax_amount = (subtotal * GST_RATE).quantize(Decimal('0.01'))
    delivery_fee = DELIVERY_FEE

    # If promo is a shipping promo, apply discount to delivery fee
    if promo_code:
        promo_obj = PromoCode.objects.filter(code__iexact=promo_code).first()
        if promo_obj and promo_obj.discount_type == 'shipping':
            # discount_amount is expected to equal delivery_fee for free shipping
            delivery_fee = max(Decimal('0.00'), DELIVERY_FEE - (discount_amount or Decimal('0.00')))

    total_amount = subtotal + tax_amount + delivery_fee

    order = Order.objects.create(
        user=user,
        payment_order_id=payment_order_id,
        payment_id=payment_id,
        payment_signature=payment_signature,
        payment_method='razorpay',
        payment_status='paid',
        payment_gateway='Razorpay',
        shipping_address=_normalize_shipping_address(shipping_address),
        customer_name=customer_name or user.get_full_name() or user.username,
        customer_email=customer_email or user.email or '',
        customer_phone=customer_phone or getattr(user, 'phone', '') or '',
        subtotal=subtotal,
        tax_amount=tax_amount,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        applied_promo_code=promo_code or '',
        discount_amount=discount_amount or Decimal('0.00'),
    )
    # Before creating order items, ensure product stock is available and decrement atomically.
    # Lock product rows to avoid race conditions. This assumes caller wraps in transaction.atomic().
    product_ids = {item.product.id for item in cart_items}
    locked_products = {
        p.id: p
        for p in Product.objects.select_for_update().filter(id__in=product_ids)
    }

    for item in cart_items:
        prod = locked_products.get(item.product.id)
        if not prod:
            raise ValueError(f'Product {item.product.title} is not available.')
        if item.quantity > prod.quantity_available:
            raise ValueError(f'Not enough stock for {prod.title}. Only {prod.quantity_available} left.')
        # decrement stock
        prod.quantity_available = max(0, prod.quantity_available - item.quantity)
        prod.save()

    for item in cart_items:
        unit_price = Decimal(str(item.product.price))
        quantity = item.quantity
        product_image = item.product.image
        if not product_image:
            first_image = item.product.images.first()
            product_image = first_image.image if first_image else ''

        OrderItem.objects.create(
            order=order,
            product=item.product,
            product_title=item.product.title,
            product_image=product_image,
            product_unit=item.product.unit or 'item',
            farmer_name=item.product.farmer.get_full_name() or item.product.farmer.username,
            unit_price=unit_price,
            quantity=quantity,
            total_price=(unit_price * quantity).quantize(Decimal('0.01')),
        )

    farmer_totals = {}
    for item in cart_items:
        farmer = getattr(item.product, 'farmer', None)
        if not farmer:
            continue
        farmer_entry = farmer_totals.setdefault(
            farmer.id,
            {
                'user': farmer,
                'items': 0,
                'total': Decimal('0.00'),
            },
        )
        farmer_entry['items'] += item.quantity
        farmer_entry['total'] += (Decimal(str(item.product.price)) * item.quantity)

    for farmer_entry in farmer_totals.values():
        farmer_user = farmer_entry['user']
        Notification.objects.create(
            user=farmer_user,
            notification_type='order',
            title='New order received',
            message=(
                f"You have a new order {order.order_number} containing {farmer_entry['items']} item(s)."
            ),
            related_order=order,
        )
        # send real-time notification via channels (if available)
        if get_channel_layer:
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f'farmer_{farmer_user.id}',
                    {'type': 'order.update', 'order_id': order.id, 'action': 'created'},
                )
            except Exception:
                logger.exception('Failed to send channel notification for new order')

    Notification.objects.create(
        user=user,
        notification_type='order',
        title='Order confirmed',
        message=f'Your order {order.order_number} has been confirmed and paid successfully.',
        related_order=order,
    )

    return order


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_promocode(request):
    code = (request.data.get('code') or '').strip()
    if not code:
        return Response({'detail': 'Promo code is required.'}, status=status.HTTP_400_BAD_REQUEST)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    subtotal = Decimal(str(cart.get_total_price()))

    promo = PromoCode.objects.filter(code__iexact=code).first()
    if not promo or not promo.active:
        return Response({'detail': 'Invalid or inactive promo code.'}, status=status.HTTP_400_BAD_REQUEST)

    if promo.expires_at and promo.expires_at < timezone.now():
        return Response({'detail': 'Promo code has expired.'}, status=status.HTTP_400_BAD_REQUEST)

    if promo.usage_limit is not None and promo.times_used >= promo.usage_limit:
        return Response({'detail': 'Promo code usage limit exceeded.'}, status=status.HTTP_400_BAD_REQUEST)

    if subtotal < (promo.min_order_amount or Decimal('0.00')):
        return Response({'detail': 'Order does not meet the minimum amount for this promo.'}, status=status.HTTP_400_BAD_REQUEST)

    if promo.discount_type == 'percent':
        discount = (subtotal * (promo.value / Decimal('100'))).quantize(Decimal('0.01'))
        subtotal_after = (subtotal - discount).quantize(Decimal('0.01'))
        tax_amount = (subtotal_after * GST_RATE).quantize(Decimal('0.01'))
        total_amount = (subtotal_after + tax_amount + DELIVERY_FEE).quantize(Decimal('0.01'))
        free_shipping = False
    elif promo.discount_type == 'fixed':
        discount = min(promo.value, subtotal)
        subtotal_after = (subtotal - discount).quantize(Decimal('0.01'))
        tax_amount = (subtotal_after * GST_RATE).quantize(Decimal('0.01'))
        total_amount = (subtotal_after + tax_amount + DELIVERY_FEE).quantize(Decimal('0.01'))
        free_shipping = False
    else:  # shipping
        discount = DELIVERY_FEE
        subtotal_after = subtotal
        tax_amount = (subtotal_after * GST_RATE).quantize(Decimal('0.01'))
        total_amount = (subtotal_after + tax_amount + max(Decimal('0.00'), DELIVERY_FEE - discount)).quantize(Decimal('0.01'))
        free_shipping = True

    return Response({
        'code': promo.code,
        'discount_amount': discount,
        'subtotal': subtotal,
        'subtotal_after': subtotal_after,
        'tax_amount': tax_amount,
        'total_amount': total_amount,
        'free_shipping': free_shipping,
    })


def _get_razorpay_credentials():
    def read_env_file(env_path):
        if not env_path.exists():
            return

        with env_path.open('r', encoding='utf-8') as handle:
            for raw_line in handle:
                line = raw_line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue

                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

    read_env_file(settings.BASE_DIR / '.env')
    read_env_file(settings.BASE_DIR.parent / 'frontend' / '.env')

    key_id = (
        os.getenv('RAZORPAY_KEY_ID')
        or os.getenv('VITE_RAZORPAY_KEY_ID')
        or os.getenv('key_id')
        or getattr(settings, 'RAZORPAY_KEY_ID', '')
    )
    key_secret = os.getenv('RAZORPAY_KEY_SECRET') or os.getenv('key_secret') or getattr(settings, 'RAZORPAY_KEY_SECRET', '')
    return key_id, key_secret


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def razorpay_create_order(request):
    key_id, key_secret = _get_razorpay_credentials()

    if not key_id or not key_secret:
        return Response(
            {'detail': 'Razorpay credentials are not configured.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    cart, _ = Cart.objects.get_or_create(user=request.user)
    subtotal = Decimal(str(cart.get_total_price()))

    # Optional promo handling
    promo_code = (request.data.get('promo_code') or '').strip()
    applied_promo = None
    discount_amount = Decimal('0.00')

    if promo_code:
        promo = PromoCode.objects.filter(code__iexact=promo_code, active=True).first()
        if promo:
            if promo.expires_at and promo.expires_at < timezone.now():
                promo = None
            elif promo.usage_limit is not None and promo.times_used >= promo.usage_limit:
                promo = None

        if promo:
            applied_promo = promo
            if promo.discount_type == 'percent':
                discount_amount = (subtotal * (promo.value / Decimal('100'))).quantize(Decimal('0.01'))
            else:
                discount_amount = min(promo.value, subtotal)

    subtotal_after = (subtotal - discount_amount).quantize(Decimal('0.01'))
    tax_amount = (subtotal_after * GST_RATE).quantize(Decimal('0.01'))
    amount = int(round((subtotal_after + tax_amount) * 100))

    if amount <= 0:
        return Response(
            {'detail': 'Your cart is empty.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    payload = json.dumps({
        'amount': amount,
        'currency': getattr(settings, 'RAZORPAY_CURRENCY', 'INR'),
        'receipt': f'cart_{request.user.id}_{cart.id}',
        'payment_capture': 1,
    }).encode('utf-8')

    credentials = base64.b64encode(f'{key_id}:{key_secret}'.encode('utf-8')).decode('ascii')
    request_obj = urllib.request.Request(
        'https://api.razorpay.com/v1/orders',
        data=payload,
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(request_obj, timeout=20) as response:
            response_data = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as error:
        error_body = error.read().decode('utf-8')
        return Response(
            {'detail': 'Unable to create Razorpay order.', 'error': error_body},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    except urllib.error.URLError:
        return Response(
            {'detail': 'Unable to reach Razorpay.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(
        {
            'key_id': key_id,
            'currency': response_data.get('currency', getattr(settings, 'RAZORPAY_CURRENCY', 'INR')),
            'amount': response_data.get('amount', amount),
            'order_id': response_data.get('id'),
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'applied_promo_code': applied_promo.code if applied_promo else '',
            'tax_amount': tax_amount,
            'total_amount': subtotal_after + tax_amount,
        }
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def razorpay_verify_payment(request):
    key_id, key_secret = _get_razorpay_credentials()

    if not key_id or not key_secret:
        return Response(
            {'detail': 'Razorpay credentials are not configured.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    razorpay_order_id = request.data.get('razorpay_order_id')
    razorpay_payment_id = request.data.get('razorpay_payment_id')
    razorpay_signature = request.data.get('razorpay_signature')
    shipping_address = request.data.get('shipping_address')
    customer_name = request.data.get('customer_name', '')
    customer_email = request.data.get('customer_email', '')
    customer_phone = request.data.get('customer_phone', '')
    promo_code = request.data.get('promo_code', '')
    discount_amount = Decimal(str(request.data.get('discount_amount', '0') or '0'))

    if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
        return Response(
            {'detail': 'Missing payment verification data.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    payload = f'{razorpay_order_id}|{razorpay_payment_id}'.encode('utf-8')
    expected_signature = hmac.new(
        key_secret.encode('utf-8'),
        payload,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, razorpay_signature):
        return Response(
            {'detail': 'Invalid Razorpay signature.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            existing_order = Order.objects.filter(payment_id=razorpay_payment_id).first()
            if existing_order:
                order = existing_order
                created = False
            else:
                order = _build_order_from_cart(
                    user=request.user,
                    payment_order_id=razorpay_order_id,
                    payment_id=razorpay_payment_id,
                    payment_signature=razorpay_signature,
                    shipping_address=shipping_address,
                    customer_name=customer_name,
                    customer_email=customer_email,
                    customer_phone=customer_phone,
                    promo_code=promo_code,
                    discount_amount=discount_amount,
                )
                created = True

            # Increment promo usage if an applied promo exists
            if created and order.applied_promo_code:
                promo_obj = PromoCode.objects.filter(code__iexact=order.applied_promo_code).first()
                if promo_obj:
                    promo_obj.times_used = (promo_obj.times_used or 0) + 1
                    promo_obj.save()

            cart, _ = Cart.objects.get_or_create(user=request.user)
            cart.items.all().delete()

    except ValueError as error:
        return Response({'detail': str(error)}, status=status.HTTP_400_BAD_REQUEST)

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def subscription_plans(request):
    """List available subscription plans."""
    plans = SubscriptionPlan.objects.filter(active=True)
    serializer = SubscriptionPlanSerializer(plans, many=True)
    return Response(serializer.data)


def _create_razorpay_plan_if_needed(plan_obj, key_id, key_secret):
    """Create a Razorpay plan for the given SubscriptionPlan if it lacks a razorpay_plan_id."""
    if plan_obj.razorpay_plan_id:
        return plan_obj.razorpay_plan_id

    interval_unit = 'monthly' if plan_obj.interval == 'monthly' else 'yearly'
    period = 1
    payload = json.dumps({
        'period': interval_unit,
        'interval': period,
        'item': {
            'name': plan_obj.name,
            'amount': int(round(plan_obj.amount * 100)),
            'currency': plan_obj.currency,
            'description': plan_obj.description or ''
        }
    }).encode('utf-8')

    credentials = base64.b64encode(f'{key_id}:{key_secret}'.encode('utf-8')).decode('ascii')
    req = urllib.request.Request(
        'https://api.razorpay.com/v1/plans',
        data=payload,
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            plan_obj.razorpay_plan_id = data.get('id')
            plan_obj.save(update_fields=['razorpay_plan_id'])
            return plan_obj.razorpay_plan_id
    except urllib.error.HTTPError as error:
        try:
            body = error.read().decode('utf-8')
        except Exception:
            body = '<unreadable body>'
        logger.exception('HTTPError from Razorpay when creating plan: %s', body)
        return None
    except Exception:
        logger.exception('Unexpected error when creating Razorpay plan')
        return None


def _plan_duration_months(plan):
    """Return subscription length in months based on plan name or interval.
    Basic -> 1, Pro -> 3, Premium -> 6. Fallback: monthly -> 1, yearly -> 12.
    """
    if not plan:
        return 0
    name = (plan.name or '').strip().lower()
    if 'basic' in name:
        return 1
    if 'pro' in name:
        return 3
    if 'premium' in name:
        return 6
    # fallback to interval
    if getattr(plan, 'interval', '') == 'yearly':
        return 12
    return 1


def _create_razorpay_customer_if_needed(user, key_id, key_secret):
    """Create a Razorpay customer for the given user; returns customer id."""
    if getattr(user, 'razorpay_customer_id', ''):
        return user.razorpay_customer_id

    customer_payload = {'name': user.get_full_name() or user.username}
    if user.email:
        customer_payload['email'] = user.email
    phone = getattr(user, 'phone', '') or ''
    if phone:
        customer_payload['contact'] = phone

    payload = json.dumps(customer_payload).encode('utf-8')

    credentials = base64.b64encode(f'{key_id}:{key_secret}'.encode('utf-8')).decode('ascii')
    req = urllib.request.Request(
        'https://api.razorpay.com/v1/customers',
        data=payload,
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    def _save_customer_id(customer_id):
        if customer_id and getattr(user, 'razorpay_customer_id', '') != customer_id:
            user.razorpay_customer_id = customer_id
            user.save(update_fields=['razorpay_customer_id'])
        return customer_id

    def _find_existing_customer_id():
        lookup_url = 'https://api.razorpay.com/v1/customers?count=100'
        lookup_req = urllib.request.Request(
            lookup_url,
            headers={
                'Authorization': f'Basic {credentials}',
                'Content-Type': 'application/json',
            },
            method='GET'
        )
        with urllib.request.urlopen(lookup_req, timeout=20) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        for item in data.get('items', []):
            if user.email and item.get('email') == user.email:
                return item.get('id')
            if phone and item.get('contact') == phone:
                return item.get('id')
        return None

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return _save_customer_id(data.get('id'))
    except urllib.error.HTTPError as error:
        try:
            body = error.read().decode('utf-8')
        except Exception:
            body = '<unreadable body>'
        logger.exception('HTTPError from Razorpay when creating customer: %s', body)
        if 'Customer already exists for the merchant' in body:
            try:
                existing_customer_id = _find_existing_customer_id()
                if existing_customer_id:
                    return _save_customer_id(existing_customer_id)
            except Exception:
                logger.exception('Failed to recover existing Razorpay customer')
        return None
    except Exception:
        logger.exception('Unexpected error when creating Razorpay customer')
        return None


def _create_local_subscription(plan, user, key_id=''):
    fake_plan_id = plan.razorpay_plan_id or f'plan_fake_{plan.id}'
    if not plan.razorpay_plan_id:
        plan.razorpay_plan_id = fake_plan_id
        plan.save(update_fields=['razorpay_plan_id'])
    # If a simulated subscription already exists for this user+plan, return it instead of creating duplicates
    existing = Subscription.objects.filter(user=user, plan=plan, razorpay_subscription_id__startswith='sub_fake_').order_by('-created_at').first()
    if existing:
        serializer = SubscriptionSerializer(existing)
        return Response({
            'subscription': serializer.data,
            'razorpay': {'id': existing.razorpay_subscription_id, 'status': existing.status, 'plan_id': fake_plan_id, 'simulated': True},
            'key_id': key_id,
        })

    razorpay_sub_id = f'sub_fake_{user.id}_{plan.id}_{int(timezone.now().timestamp())}'
    start = timezone.now()
    months = _plan_duration_months(plan)
    # approximate months as 30 days each
    end = start + timezone.timedelta(days=30 * months) if months > 0 else None
    subscription = Subscription.objects.create(
        user=user,
        plan=plan,
        razorpay_subscription_id=razorpay_sub_id,
        status='active',
        current_start=start,
        current_end=end,
        start_date=start,
        end_date=end,
    )
    _notify_user(
        user,
        notification_type='system',
        title=f'{plan.name} plan activated',
        message=f'Your {plan.name} subscription is now active. You can list up to {_subscription_plan_product_limit(plan)} products.',
    )
    serializer = SubscriptionSerializer(subscription)
    return Response({
        'subscription': serializer.data,
        'razorpay': {
            'id': razorpay_sub_id,
            'status': 'active',
            'plan_id': fake_plan_id,
            'simulated': True,
        },
        'key_id': key_id,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    """Create a Razorpay subscription for the authenticated user for a given app plan id."""
    plan_id = request.data.get('plan_id')
    if not plan_id:
        return Response({'detail': 'plan_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    plan = get_object_or_404(SubscriptionPlan, id=plan_id, active=True)

    key_id, key_secret = _get_razorpay_credentials()
    simulate = os.getenv('RAZORPAY_SIMULATE', '').lower() in {'1', 'true', 'yes'}
    if not key_id or not key_secret:
        # In local development, fall back to simulation so the UI can still be tested.
        if getattr(settings, 'DEBUG', False):
            simulate = True
        else:
            return Response({'detail': 'Razorpay credentials not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # If simulation mode is enabled, skip external Razorpay calls and create local subscription

    if simulate:
        return _create_local_subscription(plan, request.user, key_id=key_id)

    razorpay_plan_id = _create_razorpay_plan_if_needed(plan, key_id, key_secret)
    if not razorpay_plan_id:
        if getattr(settings, 'DEBUG', False):
            logger.warning('Falling back to simulated subscription because Razorpay plan creation failed in DEBUG mode.')
            return _create_local_subscription(plan, request.user, key_id=key_id)
        return Response({'detail': 'Failed to create plan on Razorpay.'}, status=status.HTTP_502_BAD_GATEWAY)

    # create customer
    customer_id = _create_razorpay_customer_if_needed(request.user, key_id, key_secret)
    if not customer_id:
        if getattr(settings, 'DEBUG', False):
            logger.warning('Falling back to simulated subscription because Razorpay customer creation failed in DEBUG mode.')
            return _create_local_subscription(plan, request.user, key_id=key_id)
        return Response({'detail': 'Failed to create Razorpay customer.'}, status=status.HTTP_502_BAD_GATEWAY)

    # create subscription
    payload = json.dumps({
        'plan_id': razorpay_plan_id,
        'customer_notify': 1,
        'total_count': 12 if plan.interval == 'monthly' else 1,
        'customer_id': customer_id
    }).encode('utf-8')

    credentials = base64.b64encode(f'{key_id}:{key_secret}'.encode('utf-8')).decode('ascii')
    req = urllib.request.Request(
        'https://api.razorpay.com/v1/subscriptions',
        data=payload,
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as error:
        # Log the error body for debugging
        try:
            body = error.read().decode('utf-8')
        except Exception:
            body = '<unreadable body>'
        logger.exception('HTTPError from Razorpay when creating subscription: %s', body)
        if getattr(settings, 'DEBUG', False):
            logger.warning('Falling back to simulated subscription because Razorpay subscription creation failed in DEBUG mode.')
            return _create_local_subscription(plan, request.user, key_id=key_id)
        return Response({'detail': 'Unable to create subscription on Razorpay.', 'error': body}, status=status.HTTP_502_BAD_GATEWAY)
    except urllib.error.URLError:
        logger.exception('URLError when contacting Razorpay')
        if getattr(settings, 'DEBUG', False):
            logger.warning('Falling back to simulated subscription because Razorpay was unreachable in DEBUG mode.')
            return _create_local_subscription(plan, request.user, key_id=key_id)
        return Response({'detail': 'Unable to reach Razorpay.'}, status=status.HTTP_502_BAD_GATEWAY)

    # persist subscription
    razorpay_sub_id = data.get('id')
    sub_status = data.get('status')
    subscription = Subscription.objects.create(
        user=request.user,
        plan=plan,
        razorpay_subscription_id=razorpay_sub_id,
        status=sub_status or 'created'
    )
    # set start/end if provided by Razorpay or compute from now based on plan interval
    try:
        if data.get('current_start'):
            subscription.current_start = timezone.datetime.fromtimestamp(int(data.get('current_start')), tz=timezone.utc)
            subscription.start_date = subscription.current_start
        else:
            subscription.start_date = timezone.now()

        if data.get('current_end'):
            subscription.current_end = timezone.datetime.fromtimestamp(int(data.get('current_end')), tz=timezone.utc)
            subscription.end_date = subscription.current_end
        else:
            months = _plan_duration_months(plan)
            subscription.end_date = (timezone.now() + timezone.timedelta(days=30 * months)) if (plan and months > 0) else None
        subscription.save(update_fields=['current_start', 'current_end', 'start_date', 'end_date', 'updated_at'])
    except Exception:
        pass

    _notify_user(
        request.user,
        notification_type='system',
        title=f'{plan.name} plan purchased',
        message=f'Your {plan.name} subscription has been created. Product limit: {_subscription_plan_product_limit(plan)} products.',
    )

    serializer = SubscriptionSerializer(subscription)
    return Response({'subscription': serializer.data, 'razorpay': data, 'key_id': key_id})


@api_view(['POST'])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    # Verify webhook signature
    payload = request.body
    signature = request.META.get('HTTP_X_RAZORPAY_SIGNATURE') or request.META.get('HTTP_X_RAZORPAY_SIGNATURE'.lower())
    secret = os.getenv('RAZORPAY_WEBHOOK_SECRET') or getattr(settings, 'RAZORPAY_WEBHOOK_SECRET', '')
    if not secret:
        return Response({'detail': 'Webhook secret not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    expected = hmac.new(secret.encode('utf-8'), payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature or ''):
        return Response({'detail': 'Invalid webhook signature.'}, status=status.HTTP_400_BAD_REQUEST)

    event = json.loads(payload.decode('utf-8'))

    # log webhook
    try:
        from .models import WebhookLog
        headers_text = json.dumps({k: v for k, v in request.META.items() if k.startswith('HTTP_')})
        WebhookLog.objects.create(event=event.get('event') or 'unknown', payload=event, headers=headers_text, signature=signature or '')
    except Exception:
        pass

    # process event and update subscription state
    try:
        _process_razorpay_event(event)
    except Exception:
        pass

    return Response({'ok': True})


def _process_razorpay_event(event):
    event_type = event.get('event')
    if not event_type:
        return

    if event_type.startswith('subscription'):
        entity = event.get('payload', {}).get('subscription', {}).get('entity', {})
        sub_id = entity.get('id')
        status_str = entity.get('status')
        sub = Subscription.objects.filter(razorpay_subscription_id=sub_id).first()
        if sub:
            # update times if present
            try:
                if entity.get('current_start'):
                    sub.current_start = timezone.datetime.fromtimestamp(int(entity.get('current_start')), tz=timezone.utc)
                    sub.start_date = sub.current_start
                if entity.get('current_end'):
                    sub.current_end = timezone.datetime.fromtimestamp(int(entity.get('current_end')), tz=timezone.utc)
                    sub.end_date = sub.current_end
            except Exception:
                pass

            prev_status = sub.status
            sub.status = status_str or sub.status
            sub.save(update_fields=['status', 'current_start', 'current_end', 'start_date', 'end_date', 'updated_at'])

            # send email notification to user when status changes
            try:
                if prev_status != sub.status:
                    # Prefer admin-configured template if available
                    try:
                        from .models import EmailTemplate
                        tpl = EmailTemplate.objects.filter(name__iexact='subscription_status_changed', is_active=True).first()
                    except Exception:
                        tpl = None

                    from_email = getattr(dj_settings, 'DEFAULT_FROM_EMAIL', None) or getattr(dj_settings, 'EMAIL_HOST_USER', None)
                    if tpl and from_email and sub.user.email:
                        subject = tpl.subject.format(username=sub.user.get_full_name() or sub.user.username, plan=(sub.plan.name if sub.plan else ''), status=sub.status)
                        body = tpl.body.format(username=sub.user.get_full_name() or sub.user.username, plan=(sub.plan.name if sub.plan else ''), status=sub.status)
                        send_mail(subject, body, from_email, [sub.user.email], fail_silently=True)
                    else:
                        subject = f"Subscription status updated: {sub.status}"
                        message = f"Hello {sub.user.get_full_name() or sub.user.username},\n\nYour subscription ({sub.plan.name if sub.plan else 'Plan'}) status is now: {sub.status}.\n\nThanks,\nNavaKrishi"
                        if from_email and sub.user.email:
                            send_mail(subject, message, from_email, [sub.user.email], fail_silently=True)
            except Exception:
                pass


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_razorpay_webhook(request):
    """Allow staff users to POST an event payload for testing without signature verification."""
    if not request.user.is_staff:
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    event = request.data.get('event')
    if not event:
        return Response({'detail': 'event JSON is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        _process_razorpay_event(event)
    except Exception as e:
        return Response({'detail': 'processing failed', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_subscriptions(request):
    subs = Subscription.objects.filter(user=request.user).order_by('-created_at')
    serializer = SubscriptionSerializer(subs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_auto_renew(request):
    sub_id = request.data.get('subscription_id')
    if not sub_id:
        return Response({'detail': 'subscription_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    val = request.data.get('auto_renew')
    if val is None:
        return Response({'detail': 'auto_renew value is required.'}, status=status.HTTP_400_BAD_REQUEST)

    sub = Subscription.objects.filter(id=sub_id, user=request.user).first()
    if not sub:
        return Response({'detail': 'Subscription not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        auto = bool(int(val)) if isinstance(val, str) or isinstance(val, int) else bool(val)
    except Exception:
        auto = bool(val)

    sub.auto_renew = auto
    sub.save(update_fields=['auto_renew', 'updated_at'])
    return Response({'subscription': SubscriptionSerializer(sub).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def renew_subscription(request):
    """Manually renew a subscription immediately. Honors auto_renew for scheduling but this forces a renewal now."""
    sub_id = request.data.get('subscription_id')
    if not sub_id:
        return Response({'detail': 'subscription_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    sub = Subscription.objects.filter(id=sub_id, user=request.user).first()
    if not sub:
        return Response({'detail': 'Subscription not found.'}, status=status.HTTP_404_NOT_FOUND)

    # If simulated subscription -> create local simulated renewal
    if sub.razorpay_subscription_id and str(sub.razorpay_subscription_id).startswith('sub_fake_'):
        start = timezone.now()
        months = _plan_duration_months(sub.plan) if sub.plan else 1
        end = start + timezone.timedelta(days=30 * months) if months > 0 else None
        with transaction.atomic():
            sub.status = 'completed'
            sub.save(update_fields=['status', 'updated_at'])
            new_sub = Subscription.objects.create(
                user=sub.user,
                plan=sub.plan,
                razorpay_subscription_id=f'sub_fake_{sub.user.id}_{sub.plan.id}_{int(start.timestamp())}',
                status='active',
                current_start=start,
                current_end=end,
                start_date=start,
                end_date=end,
            )
        return Response({'subscription': SubscriptionSerializer(new_sub).data})

    # For real subscriptions, attempt to create via Razorpay
    key_id, key_secret = _get_razorpay_credentials()
    if not key_id or not key_secret:
        if getattr(settings, 'DEBUG', False):
            # fallback to simulated renewal
            start = timezone.now()
            months = _plan_duration_months(sub.plan) if sub.plan else 1
            end = start + timezone.timedelta(days=30 * months) if months > 0 else None
            with transaction.atomic():
                sub.status = 'completed'
                sub.save(update_fields=['status', 'updated_at'])
                new_sub = Subscription.objects.create(
                    user=sub.user,
                    plan=sub.plan,
                    razorpay_subscription_id=f'sub_fake_{sub.user.id}_{sub.plan.id}_{int(start.timestamp())}',
                    status='active',
                    current_start=start,
                    current_end=end,
                    start_date=start,
                    end_date=end,
                )
            return Response({'subscription': SubscriptionSerializer(new_sub).data})
        return Response({'detail': 'Razorpay credentials not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ensure plan and customer
    razorpay_plan_id = _create_razorpay_plan_if_needed(sub.plan, key_id, key_secret)
    if not razorpay_plan_id:
        if getattr(settings, 'DEBUG', False):
            return renew_subscription(request)
        return Response({'detail': 'Failed to ensure plan on Razorpay.'}, status=status.HTTP_502_BAD_GATEWAY)

    customer_id = _create_razorpay_customer_if_needed(sub.user, key_id, key_secret)
    if not customer_id:
        if getattr(settings, 'DEBUG', False):
            return renew_subscription(request)
        return Response({'detail': 'Failed to ensure Razorpay customer.'}, status=status.HTTP_502_BAD_GATEWAY)

    payload = json.dumps({
        'plan_id': razorpay_plan_id,
        'customer_notify': 1,
        'total_count': 12 if sub.plan and sub.plan.interval == 'monthly' else 1,
        'customer_id': customer_id
    }).encode('utf-8')

    credentials = base64.b64encode(f'{key_id}:{key_secret}'.encode('utf-8')).decode('ascii')
    req = urllib.request.Request(
        'https://api.razorpay.com/v1/subscriptions',
        data=payload,
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as error:
        try:
            body = error.read().decode('utf-8')
        except Exception:
            body = '<unreadable body>'
        logger.exception('HTTPError from Razorpay when renewing subscription: %s', body)
        if getattr(settings, 'DEBUG', False):
            # fallback to simulated renewal
            return renew_subscription(request)
        return Response({'detail': 'Unable to create subscription on Razorpay.', 'error': body}, status=status.HTTP_502_BAD_GATEWAY)
    except urllib.error.URLError:
        logger.exception('URLError when contacting Razorpay')
        if getattr(settings, 'DEBUG', False):
            return renew_subscription(request)
        return Response({'detail': 'Unable to reach Razorpay.'}, status=status.HTTP_502_BAD_GATEWAY)

    # persist new subscription
    razorpay_sub_id = data.get('id')
    sub_status = data.get('status')
    with transaction.atomic():
        sub.status = 'completed'
        sub.save(update_fields=['status', 'updated_at'])
        new_sub = Subscription.objects.create(
            user=sub.user,
            plan=sub.plan,
            razorpay_subscription_id=razorpay_sub_id,
            status=sub_status or 'created'
        )
        try:
            if data.get('current_start'):
                new_sub.current_start = timezone.datetime.fromtimestamp(int(data.get('current_start')), tz=timezone.utc)
                new_sub.start_date = new_sub.current_start
            else:
                new_sub.start_date = timezone.now()

            if data.get('current_end'):
                new_sub.current_end = timezone.datetime.fromtimestamp(int(data.get('current_end')), tz=timezone.utc)
                new_sub.end_date = new_sub.current_end
            else:
                months = _plan_duration_months(sub.plan)
                new_sub.end_date = timezone.now() + timezone.timedelta(days=30 * months) if months > 0 else None
            new_sub.save(update_fields=['current_start', 'current_end', 'start_date', 'end_date', 'updated_at'])
        except Exception:
            pass

    return Response({'subscription': SubscriptionSerializer(new_sub).data, 'razorpay': data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    sub_id = request.data.get('subscription_id')
    if not sub_id:
        return Response({'detail': 'subscription_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    sub = Subscription.objects.filter(id=sub_id, user=request.user).first()
    if not sub:
        return Response({'detail': 'Subscription not found.'}, status=status.HTTP_404_NOT_FOUND)

    key_id, key_secret = _get_razorpay_credentials()
    if not key_id or not key_secret:
        # If running locally, allow simulated cancel
        if getattr(settings, 'DEBUG', False):
            simulate = True
        else:
            return Response({'detail': 'Razorpay credentials not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Support local simulation mode to avoid calling Razorpay during testing
    cancel_at_end = bool(int(request.data.get('cancel_at_end') or 0)) if str(request.data.get('cancel_at_end') or '').strip() != '' else False
    simulate = os.getenv('RAZORPAY_SIMULATE', '').lower() in {'1', 'true', 'yes'}
    if simulate:
        sub.status = 'cancel_scheduled' if cancel_at_end else 'cancelled'
        if cancel_at_end:
            # optional: set current_end to now to indicate scheduled cancellation
            sub.current_end = timezone.now()
        sub.save(update_fields=['status', 'current_end', 'updated_at'])
        return Response({'detail': 'Subscription cancelled (simulated).', 'subscription': SubscriptionSerializer(sub).data})

    # Call Razorpay to cancel
    credentials = base64.b64encode(f'{key_id}:{key_secret}'.encode('utf-8')).decode('ascii')
    req = urllib.request.Request(
        f'https://api.razorpay.com/v1/subscriptions/{sub.razorpay_subscription_id}/cancel',
        data=json.dumps({'cancel_at_end': 1 if cancel_at_end else 0}).encode('utf-8'),
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            sub.status = data.get('status') or 'cancelled'
            sub.save(update_fields=['status', 'updated_at'])
    except urllib.error.HTTPError as error:
        try:
            body = error.read().decode('utf-8')
        except Exception:
            body = '<unreadable body>'
        logger.exception('HTTPError from Razorpay when cancelling subscription: %s', body)
        if getattr(settings, 'DEBUG', False):
            # fallback to simulated cancel in dev
            sub.status = 'cancel_scheduled' if cancel_at_end else 'cancelled'
            if cancel_at_end:
                sub.current_end = timezone.now()
            sub.save(update_fields=['status', 'current_end', 'updated_at'])
            return Response({'detail': 'Subscription cancelled (simulated).', 'subscription': SubscriptionSerializer(sub).data})
        return Response({'detail': 'Unable to cancel subscription on Razorpay.', 'error': body}, status=status.HTTP_502_BAD_GATEWAY)
    except Exception:
        logger.exception('Error when contacting Razorpay for cancel')
        if getattr(settings, 'DEBUG', False):
            sub.status = 'cancel_scheduled' if cancel_at_end else 'cancelled'
            if cancel_at_end:
                sub.current_end = timezone.now()
            sub.save(update_fields=['status', 'current_end', 'updated_at'])
            return Response({'detail': 'Subscription cancelled (simulated).', 'subscription': SubscriptionSerializer(sub).data})
        return Response({'detail': 'Unable to reach Razorpay.'}, status=status.HTTP_502_BAD_GATEWAY)

    return Response({'detail': 'Subscription cancelled.', 'subscription': SubscriptionSerializer(sub).data})
