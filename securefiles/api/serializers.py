from rest_framework import serializers
from .models import User, File

import datetime

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'mfa_enabled', 'mfa_secret']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user

class FileSerializer(serializers.ModelSerializer):
    upload_date = serializers.DateTimeField(default=datetime.datetime.now)
    user_id = serializers.PrimaryKeyRelatedField(read_only=True, source='user.id')
    encrypted_content = serializers.CharField()

    class Meta:
        model = File
        fields = ['id', 'file_name', 'encrypted_content', 'upload_date', 'user_id']
