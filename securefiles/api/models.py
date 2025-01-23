from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=32, blank=True, null=True)  # Added for storing MFA secret
    groups = models.ManyToManyField(Group, related_name='api_user_groups', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='api_user_permissions', blank=True)
    
    ADMIN = 'admin'
    REGULAR = 'regular'
    GUEST = 'guest'
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (REGULAR, 'Regular'),
        (GUEST, 'Guest'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=REGULAR)


class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=100)
    encrypted_content = models.BinaryField()
    upload_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.file_name


class Permission(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    PERMISSION_CHOICES = [
        ('view', 'View'),
        ('download', 'Download'),
    ]
    permission_type = models.CharField(max_length=10, choices=PERMISSION_CHOICES)
    expiration_date = models.DateTimeField()
    
    def __str__(self):
        return f"{self.user.username} - {self.file.file_name} ({self.permission_type})"
