# users/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, GameHistory
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.conf import settings
import pyotp
import re
from django.db import IntegrityError


############################################################
## Gestion des utilisateurs ##
############################################################

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('id', 'username', 'email')

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'avatar', 'bio', 'location', 'created_at', 'updated_at']
        read_only_fields = ['username', 'email', 'created_at', 'updated_at']

    def to_representation(self, instance):
        """Personnaliser la représentation pour inclure l'URL complète de l'avatar avec le port 3443."""
        representation = super().to_representation(instance)
        request = self.context.get('request')

        if instance.avatar:
            # Utiliser build_absolute_uri pour générer l'URL complète
            representation['avatar'] = request.build_absolute_uri(instance.avatar.url)
        else:
            # URL par défaut pour l'avatar si aucun n'est défini
            default_avatar = 'avatars/default-avatar.png'
            representation['avatar'] = request.build_absolute_uri(settings.MEDIA_URL + default_avatar)

        return representation
        return representation

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        # Vérifier l'unicité de l'e-mail
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet e-mail est déjà utilisé.")

        # Définir le motif pour les e-mails *@student.42.*
        student_email_pattern = r'^[\w\.-]+@student\.42\.\w+$'
        if re.match(student_email_pattern, value):
            raise serializers.ValidationError("Les adresses e-mail *@student.42.* ne peuvent pas être utilisées pour l'inscription classique.")

        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class Register42Serializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    email = serializers.EmailField()

    def validate_email(self, value):
        # Définir le motif pour les e-mails *@student.42.*
        student_email_pattern = r'^[\w\.-]+@student\.42\.\w+$'
        if not re.match(student_email_pattern, value):
            raise serializers.ValidationError("Les adresses e-mail doivent être au format *@student.42.* pour l'inscription via OAuth.")

        # Vérifier l'unicité de l'e-mail
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet e-mail est déjà utilisé.")

        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Le nom d'utilisateur existe déjà."})
        return data

    def create(self, validated_data):
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )
            return user
        except IntegrityError:
            raise serializers.ValidationError({"error": "Erreur de création de l'utilisateur."})

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Ajout de la 2FA a la verification
	code_2fa = serializers.CharField(write_only=True, allow_blank=True)

	def validate(self, attrs):
		code_2fa = attrs.pop('code_2fa')
		data = super().validate(attrs)

		# Verification du code 2FA si 2FA actif
		user = self.user
		if user.profile.enabled_2fa:
			totp = pyotp.TOTP(user.profile.secret_2fa)
			if not totp.verify(code_2fa):
				raise serializers.ValidationError({"detail": "Invalid 2FA code."})

		# Ajoutez des informations supplémentaires au token
		data['user_id'] = user.id
		data['username'] = user.username
		data['email'] = user.email

		return data


class UserUpdateSerializer(serializers.ModelSerializer):
	username = serializers.CharField(required=False)
	email = serializers.EmailField(required=False)

	class Meta:
		model = User
		fields = ['username', 'email']

	def validate_username(self, value):
		user = self.context['request'].user
		if User.objects.exclude(pk=user.pk).filter(username=value).exists():
			raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
		return value

	def validate_email(self, value):
		user = self.context['request'].user
		if User.objects.exclude(pk=user.pk).filter(email=value).exists():
			raise serializers.ValidationError("Cette adresse email est déjà utilisée.")
		return value

	def update(self, instance, validated_data):
		user = instance
		username = validated_data.get('username', user.username)
		email = validated_data.get('email', user.email)

		user.username = username
		user.email = email
		user.save()

		return user


class PasswordChangeSerializer(serializers.Serializer):
	old_password = serializers.CharField(required=True)
	new_password = serializers.CharField(required=True)

	def validate_old_password(self, value):
		user = self.context['request'].user
		if not user.check_password(value):
			raise serializers.ValidationError("L'ancien mot de passe est incorrect.")
		return value

	def validate_new_password(self, value):
		# Ajoutez ici des validations supplémentaires pour le mot de passe si nécessaire
		if len(value) < 8:
			raise serializers.ValidationError("Le nouveau mot de passe doit comporter au moins 8 caractères.")
		return value

	def save(self, **kwargs):
		user = self.context['request'].user
		user.set_password(self.validated_data['new_password'])
		user.save()
		return user



############################################################
				## Gestion du jeu ##
############################################################

class GameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameHistory
        fields = ['id', 'opponent', 'score', 'result', 'date']

    def create(self, validated_data):
        user = self.context['request'].user  # Automatically use the authenticated user
        return GameHistory.objects.create(user=user, **validated_data)
