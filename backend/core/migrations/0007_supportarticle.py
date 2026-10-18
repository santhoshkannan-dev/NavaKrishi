from django.db import migrations, models


def seed_support_articles(apps, schema_editor):
    SupportArticle = apps.get_model('core', 'SupportArticle')

    default_articles = [
        {
            'category': 'Orders & Marketplace',
            'question': 'How can I track my order status?',
            'answer': 'Open your account settings and go to Order Details to view processing, shipped, and delivered updates.',
            'sort_order': 1,
            'is_featured': True,
        },
        {
            'category': 'Orders & Marketplace',
            'question': 'How do I download my invoice?',
            'answer': 'In Order Details, open any order card and click Download Invoice. A printable invoice is generated instantly.',
            'sort_order': 2,
            'is_featured': True,
        },
        {
            'category': 'AI Recommendations',
            'question': 'Why are AI suggestions changing each week?',
            'answer': 'Recommendations adapt to new weather forecasts, crop health trends, and farm activity updates.',
            'sort_order': 3,
            'is_featured': False,
        },
        {
            'category': 'Soil Analysis',
            'question': 'When should I update soil test values?',
            'answer': 'Update after each field test or season change for more accurate fertilizer and irrigation insights.',
            'sort_order': 4,
            'is_featured': False,
        },
        {
            'category': 'Shipping & Logistics',
            'question': 'What happens if delivery is delayed?',
            'answer': 'You receive a notification in the app, and the support team shares revised ETA and route status.',
            'sort_order': 5,
            'is_featured': False,
        },
        {
            'category': 'Farmers Community',
            'question': 'Where can I ask other farmers for help?',
            'answer': 'Use the Community Forum from Support to post questions, share crop practices, and exchange market insights.',
            'sort_order': 6,
            'is_featured': False,
        },
    ]

    for article in default_articles:
        SupportArticle.objects.get_or_create(
            question=article['question'],
            defaults=article,
        )


def unseed_support_articles(apps, schema_editor):
    SupportArticle = apps.get_model('core', 'SupportArticle')
    questions = [
        'How can I track my order status?',
        'How do I download my invoice?',
        'Why are AI suggestions changing each week?',
        'When should I update soil test values?',
        'What happens if delivery is delayed?',
        'Where can I ask other farmers for help?',
    ]
    SupportArticle.objects.filter(question__in=questions).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_notification'),
    ]

    operations = [
        migrations.CreateModel(
            name='SupportArticle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(max_length=120)),
                ('question', models.CharField(max_length=255)),
                ('answer', models.TextField()),
                ('is_featured', models.BooleanField(default=False)),
                ('is_published', models.BooleanField(default=True)),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['sort_order', '-created_at'],
            },
        ),
        migrations.RunPython(seed_support_articles, unseed_support_articles),
    ]
