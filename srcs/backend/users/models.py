from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.core.exceptions import ValidationError
import pyotp
import re

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    enabled_2fa = models.BooleanField(default=False)
    secret_2fa = models.CharField(max_length=32, blank=True, null=True)
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)

    def generate_2fa_secret(self):
        if not self.secret_2fa:
            self.secret_2fa = pyotp.random_base32()
            self.save()
        return self.secret_2fa

    def __str__(self):
        return self.user.username

def create_user_profile(sender, instance, created, **kwargs):
    """Créer un profil utilisateur chaque fois qu'un nouvel utilisateur est créé."""
    if created:
        email = instance.email
        if User.objects.filter(email__iexact=email).exclude(pk=instance.pk).exists():
            raise ValidationError("Cet e-mail est déjà utilisé.")

        UserProfile.objects.create(user=instance)

post_save.connect(create_user_profile, sender=User)

class GameHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="game_histories")
    opponent = models.CharField(max_length=150, null=True, blank=True)
    score = models.CharField(max_length=5) # INT Filed remplacer par charFiled
    result = models.CharField(max_length=10)  # "Win" ou "Loss"
    date = models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return f"{self.user.username} - {self.result} ({self.date})"
