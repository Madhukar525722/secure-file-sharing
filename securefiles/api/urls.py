from django.urls import path
from .views import RegisterView, LoginView, FileUploadView, user_files

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('fileupload/', FileUploadView.as_view(), name='fileupload'),
]
