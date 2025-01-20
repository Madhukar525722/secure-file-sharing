from django.urls import path
from .views import RegisterView, LoginView, FileUploadView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('upload/', FileUploadView.as_view(), name='upload'),
]