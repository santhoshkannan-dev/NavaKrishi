from django.core.management.base import BaseCommand
from django.utils.text import slugify
from accounts.models import User
from core.models import Category, Product
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed marketplace with sample categories and products'

    def handle(self, *args, **options):
        # Create categories
        categories_data = [
            {'name': 'Vegetables', 'description': 'Fresh vegetables from local farmers', 'icon': '🥬'},
            {'name': 'Fruits', 'description': 'Fresh and organic fruits', 'icon': '🍎'},
            {'name': 'Grains & Pulses', 'description': 'Organic grains, lentils, and pulses', 'icon': '🌾'},
            {'name': 'Organic Honey', 'description': 'Pure, organic honey from local apiaries', 'icon': '🍯'},
            {'name': 'Organic Farm Items', 'description': 'Organic farming essentials and natural farm supplies', 'icon': '🚜'},
            {'name': 'Spices', 'description': 'Organic spices from local farmers', 'icon': '🌶️'},
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'icon': cat_data['icon']
                }
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created category: {cat_data["name"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'→ Category already exists: {cat_data["name"]}'))

        # Create or get farmer users
        farmers_data = [
            {'email': 'green_valley@example.com', 'username': 'green_valley_farms', 'first_name': 'Green', 'last_name': 'Valley'},
            {'email': 'blossom@example.com', 'username': 'blossom_apiary', 'first_name': 'Blossom', 'last_name': 'Apiary'},
            {'email': 'spice_trail@example.com', 'username': 'spice_trail_farms', 'first_name': 'Spice', 'last_name': 'Trail'},
            {'email': 'leafy_greens@example.com', 'username': 'leafy_greens_co', 'first_name': 'Leafy', 'last_name': 'Greens'},
        ]

        farmers = {}
        for farmer_data in farmers_data:
            farmer, created = User.objects.get_or_create(
                email=farmer_data['email'],
                defaults={
                    'username': farmer_data['username'],
                    'first_name': farmer_data['first_name'],
                    'last_name': farmer_data['last_name'],
                    'role': 'farmer'
                }
            )
            farmers[farmer_data['username']] = farmer
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created farmer: {farmer_data["username"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'→ Farmer already exists: {farmer_data["username"]}'))

        # Create products
        products_data = [
            {
                'title': 'Heirloom Tomatoes',
                'farmer': 'green_valley_farms',
                'category': 'Vegetables',
                'description': 'Beautiful heirloom tomatoes with rich, complex flavors',
                'price': Decimal('4.50'),
                'unit': 'lb',
                'quantity_available': 100,
                'badge': 'Organic Certified',
                'badge_color': 'bg-[#dff5d8] text-[#267320]',
                'rating': 4.8,
                'reviews': 124,
                'image': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=500&fit=crop'
            },
            {
                'title': 'Organic Raw Honey',
                'farmer': 'blossom_apiary',
                'category': 'Organic Honey',
                'description': 'Pure, unfiltered honey from our apiaries',
                'price': Decimal('12.00'),
                'unit': 'bottle',
                'quantity_available': 50,
                'rating': 4.9,
                'reviews': 89,
                'image': 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=500&h=500&fit=crop'
            },
            {
                'title': 'Raw Turmeric Root',
                'farmer': 'spice_trail_farms',
                'category': 'Grains & Pulses',
                'description': 'Fresh turmeric root with high curcumin content',
                'price': Decimal('3.20'),
                'unit': 'oz',
                'quantity_available': 75,
                'badge': 'High Antioxidant',
                'badge_color': 'bg-[#f2eee6] text-[#6d5c3d]',
                'rating': 4.7,
                'reviews': 42,
                'image': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&h=500&fit=crop'
            },
            {
                'title': 'Baby Spinach',
                'farmer': 'leafy_greens_co',
                'category': 'Vegetables',
                'description': 'Tender baby spinach leaves, perfect for salads and cooking',
                'price': Decimal('3.99'),
                'unit': 'pk',
                'quantity_available': 120,
                'rating': 4.6,
                'reviews': 215,
                'image': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&h=500&fit=crop'
            },
            {
                'title': 'Fresh Strawberries',
                'farmer': 'green_valley_farms',
                'category': 'Fruits',
                'description': 'Sweet and juicy strawberries, picked fresh daily',
                'price': Decimal('5.99'),
                'unit': 'lb',
                'quantity_available': 60,
                'badge': 'Farm Fresh',
                'badge_color': 'bg-[#fce7e6] text-[#c41e3a]',
                'rating': 4.9,
                'reviews': 178,
                'image': 'https://images.unsplash.com/photo-1587040441167-1aa500764cbd?w=500&h=500&fit=crop'
            },
            {
                'title': 'Organic Lentils',
                'farmer': 'spice_trail_farms',
                'category': 'Grains & Pulses',
                'description': 'Premium quality organic red lentils',
                'price': Decimal('8.50'),
                'unit': 'lb',
                'quantity_available': 200,
                'badge': 'Organic Certified',
                'badge_color': 'bg-[#dff5d8] text-[#267320]',
                'rating': 4.7,
                'reviews': 95,
                'image': 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=500&h=500&fit=crop'
            },
            {
                'title': 'Fresh Carrots',
                'farmer': 'leafy_greens_co',
                'category': 'Vegetables',
                'description': 'Crisp, sweet carrots perfect for snacking or cooking',
                'price': Decimal('2.50'),
                'unit': 'lb',
                'quantity_available': 150,
                'rating': 4.5,
                'reviews': 132,
                'image': 'https://images.unsplash.com/photo-1447921212404-8691f6468588?w=500&h=500&fit=crop'
            },
            {
                'title': 'Organic Blueberries',
                'farmer': 'blossom_apiary',
                'category': 'Fruits',
                'description': 'Plump, antioxidant-rich organic blueberries',
                'price': Decimal('7.99'),
                'unit': 'lb',
                'quantity_available': 40,
                'badge': 'Organic Certified',
                'badge_color': 'bg-[#dff5d8] text-[#267320]',
                'rating': 4.8,
                'reviews': 203,
                'image': 'https://images.unsplash.com/photo-1599599810694-b5ac4dd64e6c?w=500&h=500&fit=crop'
            },
            {
                'title': 'Organic Compost Mix',
                'farmer': 'leafy_greens_co',
                'category': 'Organic Farm Items',
                'description': 'Natural compost blend for healthier soil and stronger crops',
                'price': Decimal('9.50'),
                'unit': 'bag',
                'quantity_available': 80,
                'badge': 'Soil Friendly',
                'badge_color': 'bg-[#eef7e8] text-[#2f6b1f]',
                'rating': 4.7,
                'reviews': 56,
                'image': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&h=500&fit=crop'
            },
            {
                'title': 'Organic Seed Pack',
                'farmer': 'green_valley_farms',
                'category': 'Organic Farm Items',
                'description': 'Non-GMO seed assortment for seasonal organic planting',
                'price': Decimal('6.75'),
                'unit': 'pack',
                'quantity_available': 140,
                'badge': 'Grow Naturally',
                'badge_color': 'bg-[#f2f8ea] text-[#3d7422]',
                'rating': 4.8,
                'reviews': 71,
                'image': 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=500&h=500&fit=crop'
            },
        ]

        for product_data in products_data:
            farmer = farmers[product_data.pop('farmer')]
            category = categories[product_data.pop('category')]
            
            product, created = Product.objects.get_or_create(
                title=product_data['title'],
                farmer=farmer,
                category=category,
                defaults={**product_data, 'is_active': True}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created product: {product_data["title"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'→ Product already exists: {product_data["title"]}'))

        self.stdout.write(self.style.SUCCESS('\n✓ Marketplace seed data created successfully!'))
