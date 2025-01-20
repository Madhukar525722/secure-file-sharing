from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, File
from .serializers import UserSerializer, FileSerializer
import pyotp

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def post(self,request):
        pass

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        mfa_token = request.data.get('mfa_token')
        user = User.objects.filter(username=username).first()
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

class FileUploadView(generics.CreateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)