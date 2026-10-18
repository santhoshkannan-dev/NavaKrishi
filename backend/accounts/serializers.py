from rest_framework import serializers

from .models import User

from .models import Address


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)
    accepted_terms = serializers.BooleanField(write_only=True, required=True)
    accepted_terms_role = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    accepted_terms_version = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'username',
            'email',
            'password',
            'role',
            'phone',
            'avatar',
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
            'accepted_terms',
            'accepted_terms_role',
            'accepted_terms_version',
        ]

    def validate(self, attrs):
        if not attrs.get('accepted_terms'):
            raise serializers.ValidationError({'accepted_terms': 'You must accept the terms before creating an account.'})

        role = (attrs.get('role') or '').strip().lower()
        accepted_role = (attrs.get('accepted_terms_role') or '').strip().lower()
        if accepted_role and accepted_role != role:
            raise serializers.ValidationError({'accepted_terms_role': 'Accepted terms role must match the selected role.'})

        return attrs

    def create(self, validated_data):
        accepted_terms = validated_data.pop('accepted_terms', False)
        accepted_terms_role = validated_data.pop('accepted_terms_role', '')
        accepted_terms_version = validated_data.pop('accepted_terms_version', '2026-05')

        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            phone=validated_data.get('phone', ''),
            avatar=validated_data.get('avatar'),
            farm_name=validated_data.get('farm_name', ''),
            farm_location=validated_data.get('farm_location', ''),
            farm_bio=validated_data.get('farm_bio', ''),
            farm_logo=validated_data.get('farm_logo'),
            preferred_currency=validated_data.get('preferred_currency', 'INR'),
            unit_of_measure=validated_data.get('unit_of_measure', 'metric'),
            yield_prediction_alerts=validated_data.get('yield_prediction_alerts', True),
            irrigation_tips_enabled=validated_data.get('irrigation_tips_enabled', True),
            order_notifications_enabled=validated_data.get('order_notifications_enabled', True),
            weekly_summary_emails=validated_data.get('weekly_summary_emails', True),
        )

        if accepted_terms:
            user.mark_terms_accepted(role=accepted_terms_role or validated_data['role'], version=accepted_terms_version)
            user.save(update_fields=['terms_accepted', 'terms_accepted_role', 'terms_accepted_version', 'terms_accepted_at'])

        return user


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "label",
            "address",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "pincode",
            "country",
            "phone",
            "is_default",
            "created_at",
        ]


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    farm_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "avatar",
            "avatar_url",
            "farm_name",
            "farm_location",
            "farm_bio",
            "farm_logo",
            "farm_logo_url",
            "preferred_currency",
            "unit_of_measure",
            "yield_prediction_alerts",
            "irrigation_tips_enabled",
            "order_notifications_enabled",
            "weekly_summary_emails",
            "terms_accepted",
            "terms_accepted_role",
            "terms_accepted_version",
            "terms_accepted_at",
        ]
        extra_kwargs = {
            "email": {"read_only": True},
            "avatar": {"write_only": True, "required": False, "allow_null": True},
            "farm_logo": {"write_only": True, "required": False, "allow_null": True},
        }

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return ""

        request = self.context.get("request")
        avatar_url = obj.avatar.url
        if request is not None:
            return request.build_absolute_uri(avatar_url)

        return avatar_url

    def get_farm_logo_url(self, obj):
        if not obj.farm_logo:
            return ""

        request = self.context.get("request")
        logo_url = obj.farm_logo.url
        if request is not None:
            return request.build_absolute_uri(logo_url)

        return logo_url