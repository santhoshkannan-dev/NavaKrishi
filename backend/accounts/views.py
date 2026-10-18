from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Address
from .serializers import RegisterSerializer, AddressSerializer, UserSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    user = request.user

    if not current_password or not new_password:
        return Response({'error': 'Current password and new password are required.'}, status=400)

    if new_password != confirm_password:
        return Response({'error': 'New password and confirmation do not match.'}, status=400)

    if not user.check_password(current_password):
        return Response({'error': 'Current password is incorrect'}, status=401)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password changed successfully'})


@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Account created successfully',
            'user': UserSerializer(user, context={'request': request}).data,
        })

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user_obj = User.objects.get(email=email)
        user = authenticate(
            username=user_obj.username,
            password=password,
        )
    except User.DoesNotExist:
        user = None

    if user is not None:
        refresh = RefreshToken.for_user(user)
        serialized_user = UserSerializer(user, context={'request': request})

        return Response({
            'token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': serialized_user.data,
        })

    return Response({
        'error': 'Invalid credentials'
    }, status=401)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, FormParser, MultiPartParser])
def profile(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)

    # PUT
    serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(user, context={'request': request}).data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def addresses_list_create(request):
    user = request.user

    if request.method == 'GET':
        qs = Address.objects.filter(user=user).order_by('-is_default', '-created_at')
        serializer = AddressSerializer(qs, many=True)
        return Response(serializer.data)

    # POST
    data = request.data.copy()
    data['user'] = user.id
    serializer = AddressSerializer(data=data)
    if serializer.is_valid():
        addr = serializer.save(user=user)
        # if this is set default, unset others
        if addr.is_default:
            Address.objects.filter(user=user).exclude(id=addr.id).update(is_default=False)
        return Response(AddressSerializer(addr).data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def address_detail(request, pk):
    user = request.user
    try:
        addr = Address.objects.get(pk=pk, user=user)
    except Address.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if request.method == 'DELETE':
        addr.delete()
        return Response({'message': 'Deleted'})

    # PUT
    serializer = AddressSerializer(addr, data=request.data, partial=True)
    if serializer.is_valid():
        addr = serializer.save()
        if addr.is_default:
            Address.objects.filter(user=user).exclude(id=addr.id).update(is_default=False)
        return Response(AddressSerializer(addr).data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)