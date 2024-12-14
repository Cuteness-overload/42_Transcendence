from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from rest_framework import status

class UserTests(APITestCase):
    def test_register(self):
        response = self.client.post('/users/register/', {
            'username': 'testuser',
            'password': 'testpassword',
            'email': 'testuser@example.com'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_login(self):
        User.objects.create_user(username='testuser', password='testpassword', email='testuser@example.com')
        response = self.client.post('/users/login/', {
            'username': 'testuser',
            'password': 'testpassword',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_profile(self):
        user = User.objects.create_user(username='testuser', password='testpassword', email='testuser@example.com')
        self.client.force_authenticate(user=user)
        response = self.client.get('/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass', email='test@example.com')
        self.client.login(username='testuser', password='testpass')

    def test_get_profile(self):
        response = self.client.get('/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_update_profile(self):
        response = self.client.patch('/users/profile/', {'bio': 'New bio'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'New bio')
