from django.urls import path
from .views import RegisterView, LoginView, FileUploadView, ListUserFilesView, DownloadFileView, CreateShareLinkView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('fileupload/', FileUploadView.as_view(), name='fileupload'),
    path('files/', ListUserFilesView.as_view(), name='files'),
    path('files/download/<int:file_id>/', DownloadFileView.as_view(), name='filedownload'),
    path('files/share/<int:file_id>/', CreateShareLinkView.as_view(), name='create_share_link')
]
