import jwt
import os
import base64
from datetime import datetime, timezone, timedelta
from django.conf import settings
from django.http import HttpResponse, Http404, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView, View
from rest_framework_simplejwt.tokens import RefreshToken
from urllib.parse import quote
from .models import User, File, ShareLink
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

class ListUserFilesView(APIView):
    @permission_classes([permissions.IsAuthenticated])
    def get(self, request, *args, **kwargs):
        auth_header = self.request.headers.get('Authorization')
        token = auth_header.split(' ')[1] if auth_header else None
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = decoded.get('user_id')
        files = File.objects.filter(user_id=user_id)
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
                encrypted_content = self.request.data.get('encrypted_content')
                encrypted_content_bytes = base64.b64decode(encrypted_content)
                print(f"Encrypted content (base64 decoded bytes): {encrypted_content}")
                serializer.save(user=user, encrypted_content=encrypted_content_bytes)
            except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist) as e:
                print(f"JWT decoding error or user not found: {e}")


class DownloadFileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id, *args, **kwargs):
        auth_header = self.request.headers.get('Authorization')
        token = auth_header.split(' ')[1] if auth_header else None
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = decoded.get('user_id')
        try:
            file = File.objects.get(id=file_id, user_id=user_id)
        except File.DoesNotExist:
            raise Http404("File does not exist")

        encrypted_content = file.encrypted_content
        decrypted_content = base64.b64encode(encrypted_content)  # Decrypt content
        print(f"Encrypted content (base64 decoded bytes): {decrypted_content}")
        
        
        response = HttpResponse(decrypted_content, content_type="application/octet-stream")
        response['Content-Disposition'] = f'attachment; filename="{quote(file.file_name)}"'
        return response

class CreateShareLinkView(View):
    def post(self, request, file_id):
        try:
            file = File.objects.get(id=file_id)
            encrypted_content = file.encrypted_content
            decrypted_content = base64.b64encode(encrypted_content)

            new_file = File.objects.create(
                user=file.user,
                file_name=file.file_name,
                encrypted_content=decrypted_content,
                upload_date=file.upload_date
            )
            print(new_file.encrypted_content)

        except File.DoesNotExist:
            raise Http404("File does not exist")
        
        link_type = request.POST.get('link_type', 'download')
        if link_type not in ['view', 'download']:
            return JsonResponse({'error': 'Invalid link type'}, status=400)
        
        expiration_time = datetime.now() + timedelta(hours=1)  # link expires in 1 hour
        share_link = ShareLink.objects.create(file=new_file, expiration_time=expiration_time)
        return JsonResponse({'share_link': request.build_absolute_uri(f'/api/files/share/{share_link.token}/')})
    
        # response = HttpResponse(decrypted_content, content_type='application/octet-stream')
        # response['Content-Disposition'] = f'attachment; filename="{share_link.file.file_name}"'
        # return response


# class DownloadViaShareLinkView(View):
#     def get(self, request, token):
#         try:
#             share_link = ShareLink.objects.get(token=token)
#         except ShareLink.DoesNotExist:
#             raise Http404("Share link not found")

#         # Mark the link as used
#         share_link.used = True
#         share_link.save()

        # response = HttpResponse(share_link.file.content, content_type='application/octet-stream')
        # response['Content-Disposition'] = f'attachment; filename="{share_link.file.file_name}"'
        # return response

def handle_share_link(request, token):
    # Retrieve the share link from the database
    share_link = get_object_or_404(ShareLink, token=token)
    
    # Now you can handle the shared file using share_link.file_id
    # For example, you can return the file or its details
    return JsonResponse({'file': share_link.file})