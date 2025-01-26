# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.test import TestCase

# Create your tests here.
class ApiTests(TestCase):
    def test_register_view(self):
        # Test the register view
        response = self.client.post('/api/register/', {'username': 'user', 'password': 'user'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {'success': 'User registered successfully'})

    def test_login_view(self):
        # Test the login view
        response = self.client.post('/api/login/', {'username': 'user', 'password': 'invalid'})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {'error': 'Invalid credentials'})

    def test_list_user_files_view(self):
        # Test the list user files view
        response = self.client.get('/api/files/')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data, {'detail': 'Authentication credentials were not provided.'})

    def test_list_user_files_view_authenticated(self):
        # Test the list user files view with authentication
        response = self.client.post('/api/login/', {'username': 'user', 'password': 'user'})
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        response = self.client.get('/api/files/', HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_list_user_files_view_authenticated_with_files(self):
        # Test the list user files view with authentication and files
        response = self.client.post('/api/login/', {'username': 'user', 'password': 'user'})
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        response = self.client.get('/api/files/', HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])
        # Upload a file
        response = self.client.post('/api/files/', {'name': 'test.txt', 'file': 'test content'}, HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {'success': 'File uploaded successfully'})
        # Get the list of files
        response = self.client.get('/api/files/', HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [{'name': 'test.txt', 'url': '/api/files/test.txt'}])

    def test_file_upload_view(self):
        # Test the file upload view
        response = self.client.post('/api/files/', {'name': 'test.txt', 'file': 'test content'})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data, {'detail': 'Authentication credentials were not provided.'})

    def test_file_upload_view_authenticated(self):
        # Test the file upload view with authentication
        response = self.client.post('/api/login/', {'username': 'user', 'password': 'user'})
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        response = self.client.post('/api/files/', {'name': 'test.txt', 'file': 'test content'}, HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {'success': 'File uploaded successfully'})

    def test_file_download_view(self):
        # Test the file download view
        response = self.client.get('/api/files/test.txt')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data, {'detail': 'Authentication credentials were not provided.'})

    def test_file_download_view_authenticated(self):
        # Test the file download view with authentication
        response = self.client.post('/api/login/', {'username': 'user', 'password': 'user'})
        self.assertEqual(response.status_code, 200)
        access_token = response.data['access']
        response = self.client.post('/api/files/', {'name': 'test.txt', 'file': 'test content'}, HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.assertEqual(response.status_code, 201)
        response = self.client.get('/api/files/test.txt', HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'test content')