import jwt
import base64
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, File
from .serializers import UserSerializer, FileSerializer
import pyotp
import logging

# Set up logging
logger = logging.getLogger(__name__)

from django.contrib.auth.hashers import make_password

class RegisterView(APIView):
    def post(self, request):
        required_fields = ['username', 'password']
        for field in required_fields:
            if field not in request.data:
                return Response({'error': f'Missing field: {field}'}, status=400)

        username = request.data['username']
        password = make_password(request.data['password'])  # Hash the password before saving

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        User.objects.create(username=username, password=password)
        return Response({'success': 'User registered successfully'}, status=201)

# Existing views like LoginView and FileUploadView should remain as they are
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        mfa_token = request.data.get('mfa_token')
        user = User.objects.filter(username=username).first()
        # Log for debugging token behavior
        if user:
            print(f"User found: {user.username}")
        else:
            print("User not found or credentials are invalid.")
        if user and user.check_password(password):
            if user.mfa_enabled:
                totp = pyotp.TOTP(user.mfa_secret)
                if totp.verify(mfa_token):
                    refresh = RefreshToken.for_user(user)
                    return Response({'refresh': str(refresh), 'access': str(refresh.access_token)})
                else:
                    return Response({'error': 'Invalid MFA token'}, status=400)
            else:
                refresh = RefreshToken.for_user(user)
                return Response({'refresh': str(refresh), 'access': str(refresh.access_token)})
        return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_files(request):
    user = request.user
    files = File.objects.filter(user=user)
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

class FileUploadView(generics.CreateAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Decode the JWT token to verify correct user
        auth_header = self.request.headers.get('Authorization')
        token = auth_header.split(' ')[1] if auth_header else None
        if token:
            try:
                decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded.get('user_id')
                print(f"Decoded user_id: {user_id}")
                user = User.objects.get(id=user_id)
                encrypted_content_base64 = decoded.get('encrypted_content', '')
                encrypted_content_bytes = base64.b64decode(encrypted_content_base64)
                print(f"Encrypted content (base64 decoded bytes): {encrypted_content_bytes}")
                serializer.save(user=user, encrypted_content=encrypted_content_bytes)
            except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist) as e:
                print(f"JWT decoding error or user not found: {e}")
