# users/views.py

import hmac
import hashlib
import base64
import os
import requests
import pyotp
import qrcode
from io import BytesIO
import urllib.parse  # encode url
import re  # regular expressions
from django.http import HttpResponseRedirect
from django.db import IntegrityError
from django.shortcuts import redirect
from rest_framework.renderers import StaticHTMLRenderer
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny, BasePermission
from django.core.management import call_command
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django_ratelimit.decorators import ratelimit
from .authentication import CookieJWTAuthentication
from django.utils.decorators import method_decorator
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    Register42Serializer,
    GameHistorySerializer
)
from .models import UserProfile, User, GameHistory

User = get_user_model()

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)

class ResetDatabaseView(APIView):
    """
    Endpoint pour réinitialiser la base de données. Utilisable uniquement par un admin.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        try:
            call_command('flush', '--no-input')
            call_command('migrate', '--no-input')
            return Response({"message": "Database reset successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ClearCookiesView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        response = Response({"detail": "Cookies supprimés avec succès"}, status=status.HTTP_200_OK)

        # Liste de tous les cookies à supprimer
        cookies_to_delete = [
            'jwt_access_token',
            'jwt_refresh_token',
            'oauth_email',
            'user_exists',
            # Ajoutez ici d'autres cookies si nécessaire
        ]

        for cookie in cookies_to_delete:
            response.delete_cookie(cookie, path='/')  # Ajustez le path si nécessaire

        logger.debug("Tous les cookies ont été supprimés via ClearCookiesView.")
        return response

################################
### Gestion des utilisateurs ###
################################

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    @method_decorator(ratelimit(key='ip', rate='40/m', block=True))  # ajuster le taux en production
    def post(self, request, *args, **kwargs):
        try:
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                # Assurez-vous que le profil est créé
                try:
                    profile = user.profile
                except UserProfile.DoesNotExist:
                    UserProfile.objects.create(user=user)

                # Générer les tokens JWT
                refresh = RefreshToken.for_user(user)

                # Préparer la réponse
                response = Response({
                    "user_id": user.id,
                    "username": user.username,
                    "email": user.email,
                }, status=status.HTTP_201_CREATED)

                # Définir les cookies HttpOnly pour les tokens
                response.set_cookie(
                    'jwt_access_token',
                    str(refresh.access_token),
                    httponly=True,
                    secure=True,  # Mettre à True en production
                    samesite='Lax',
                )
                response.set_cookie(
                    'jwt_refresh_token',
                    str(refresh),
                    httponly=True,
                    secure=True,  # Mettre à True en production
                    samesite='Lax',
                )

                logger.debug(f"User {user.username} registered classically, JWT cookies set.")

                return response
            else:
                logger.warning(f"Registration failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error during registration: {str(e)}")
            return Response({"error": "Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer  # Assurez-vous d'utiliser le serializer personnalisé

    def post(self, request, *args, **kwargs):
        logger.debug(f"Token obtain request data: {request.data}")
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            tokens = response.data
            response.set_cookie('jwt_access_token', tokens['access'], httponly=True, secure=True, samesite='Lax')
            response.set_cookie('jwt_refresh_token', tokens['refresh'], httponly=True, secure=True, samesite='Lax')
            del response.data['access']
            del response.data['refresh']
            logger.debug("JWT cookies set successfully.")
        return response

import logging

# Configurez le logger
logger = logging.getLogger(__name__)

class VerifyAccessTokenFromCookie(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = request.COOKIES.get('jwt_access_token')
        if not token:
            logger.warning("Access token is missing in cookies.")
            return Response({"error": "Access token is missing."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Décoder et valider le token
            access_token = AccessToken(token)
            logger.debug(f"Access Token Claims: {access_token}")

            # Récupérer l'utilisateur associé au token
            user_id = access_token['user_id']
            logger.debug(f"User ID from Token: {user_id}")

            try:
                user = User.objects.get(id=user_id)
                if not user.is_active:
                    logger.warning("User is not active.")
                    return Response({"detail": "User not found"}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                logger.warning("User does not exist.")
                return Response({"detail": "User not found"}, status=status.HTTP_401_UNAUTHORIZED)

            return Response({"valid": True}, status=status.HTTP_200_OK)
        except (TokenError, InvalidToken) as e:
            logger.error(f"Invalid token: {str(e)}")
            return Response({"error": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Error during token verification: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        logger.debug("Requête de rafraîchissement des tokens reçue.")
        refresh_token = request.COOKIES.get('jwt_refresh_token')
        if not refresh_token:
            logger.warning("Refresh token manquant dans les cookies.")
            return Response({"error": "Refresh token not provided."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data={'refresh': refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
            logger.debug("Refresh token valide.")
        except TokenError as e:
            logger.error(f"Erreur de token lors du rafraîchissement : {e}")
            raise InvalidToken(e.args[0])

        data = serializer.validated_data
        access = data['access']
        refresh = data.get('refresh', refresh_token)  # Utiliser le nouveau refresh token si disponible

        response = Response({"message": "Tokens refreshed successfully."}, status=status.HTTP_200_OK)
        response.set_cookie(
            'jwt_access_token',
            access,
            httponly=True,
            secure=True,  # Mettre à True en production
            samesite='Lax',
            path='/'
        )
        if refresh:
            response.set_cookie(
                'jwt_refresh_token',
                refresh,
                httponly=True,
                secure=True,  # Mettre à True en production
                samesite='Lax',
                path='/'
            )
            logger.debug(f"Nouvel access token : {access}")
            logger.debug(f"Nouvel refresh token : {refresh}")
        logger.debug("Tokens rafraîchis et cookies mis à jour.")
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = Response({"detail": "Déconnecté avec succès"}, status=status.HTTP_200_OK)
        response.delete_cookie('jwt_access_token')
        response.delete_cookie('jwt_refresh_token')
        response.delete_cookie('oauth_email')
        response.delete_cookie('user_exists')
        logger.debug("User logged out, cookies deleted.")
        return response

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Récupération des informations complètes du profil utilisateur."""
        user = request.user
        try:
            profile = user.profile  # Accès correct via related_name='profile'
        except UserProfile.DoesNotExist:
            return Response({"detail": "Profil non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        profile_serializer = UserProfileSerializer(profile, context={'request': request})
        user_serializer = UserSerializer(user)

        response_data = profile_serializer.data
        response_data.update(user_serializer.data)

        # Gestion explicite si l'avatar est vide
        if not profile.avatar:
            response_data['avatar'] = None

        return Response(response_data, status=status.HTTP_200_OK)

    def patch(self, request):
        """Mise à jour partielle des informations utilisateur (username, email, bio, location, avatar)."""
        user = request.user
        data = request.data.copy()
        files = request.FILES

        # Initialiser des dictionnaires pour séparer les données utilisateur et profil
        user_data = {}
        profile_data = {}

        # Séparer les données basées sur les clés
        for key, value in data.items():
            if key in ['username', 'email']:
                user_data[key] = value
            elif key in ['bio', 'location', 'avatar']:
                profile_data[key] = value
            else:
                return Response({"detail": f"Champ non autorisé : {key}"}, status=status.HTTP_400_BAD_REQUEST)

        # Gérer le fichier 'avatar' s'il est présent
        if 'avatar' in files:
            profile_data['avatar'] = files['avatar']

        response = {}

        # Mettre à jour les données utilisateur si présentes
        if user_data:
            serializer = UserUpdateSerializer(user, data=user_data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                response.update(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Mettre à jour les données du profil si présentes
        if profile_data:
            try:
                profile = user.profile
            except UserProfile.DoesNotExist:
                return Response({"detail": "Profil non trouvé."}, status=status.HTTP_404_NOT_FOUND)
            serializer = UserProfileSerializer(profile, data=profile_data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                response.update(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(response, status=status.HTTP_200_OK)

    def delete(self, request):
        """Suppression du compte utilisateur."""
        user = request.user
        user.delete()  # Supprime l'utilisateur et les objets liés (comme le profil)
        return Response({"detail": "Compte supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)

class PasswordChangeView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		"""Modification du mot de passe utilisateur."""
		code = request.data.get('code_2fa')
		user = request.user.profile
		if user.enabled_2fa:
			totp = pyotp.TOTP(user.secret_2fa)
			if not totp.verify(code):
				return Response({"detail": "Code 2FA invalide."}, status=status.HTTP_400_BAD_REQUEST)
		serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
		if serializer.is_valid():
			serializer.save()
			return Response({"detail": "Mot de passe mis à jour avec succès."}, status=status.HTTP_200_OK)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def hmac_sha256(key, message):
    digest = hmac.new(
        key.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).digest()
    return base64.urlsafe_b64encode(digest).decode("utf-8").replace("=", "")

class VerifyJWTView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            token = request.data.get('jwt')
            header, payload, signature = token.split(".")
            SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
            expected_signature = hmac_sha256(SECRET_KEY, f"{header}.{payload}")
            if not hmac.compare_digest(signature, expected_signature):
                return Response({"message": "Invalid JWT."}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({"message": "JWT is Valid"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid JWT."}, status=status.HTTP_401_UNAUTHORIZED)


class OAuthVerifiedPermission(BasePermission):
    """Permission pour vérifier si l'utilisateur a été vérifié via OAuth 42."""
    def has_permission(self, request, view):
        return request.session.get('oauth_verified', False)

class OAuthInitiateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        client_id = os.getenv('CLIENT_ID')  # Assurez-vous que ces variables d'environnement sont définies
        redirect_uri = os.getenv('REDIRECT_URI')
        scope = 'public'
        state = 'random_state_string'  # Idéalement, générez un état aléatoire pour la sécurité

        authorization_url = (
            f"https://api.intra.42.fr/oauth/authorize?"
            f"client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scope}&state={state}"
        )
        return redirect(authorization_url)

class OAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')  # Si vous utilisez l'état pour la sécurité

        if not code:
            return Response({"error": "Code d'autorisation manquant."}, status=status.HTTP_400_BAD_REQUEST)

        # Échange du code d'autorisation contre un token d'accès
        token_url = "https://api.intra.42.fr/oauth/token"
        client_id = os.getenv('CLIENT_ID')
        client_secret = os.getenv('CLIENT_SECRET')
        redirect_uri = os.getenv('REDIRECT_URI')

        data = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': redirect_uri
        }

        token_response = requests.post(token_url, data=data)
        if token_response.status_code != 200:
            return Response({"error": "Échec de l'obtention du token d'accès."}, status=status.HTTP_400_BAD_REQUEST)

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        # Utiliser le token d'accès pour obtenir les informations utilisateur
        user_info_url = "https://api.intra.42.fr/v2/me"
        headers = {'Authorization': f'Bearer {access_token}'}
        user_info_response = requests.get(user_info_url, headers=headers)

        if user_info_response.status_code != 200:
            return Response({"error": "Échec de la récupération des informations utilisateur."}, status=status.HTTP_400_BAD_REQUEST)

        user_info = user_info_response.json()
        email = user_info.get('email')

        if not email:
            return Response({"error": "Email non disponible via OAuth."}, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier si l'e-mail correspond au format *@student.42.*
        student_email_pattern = r'^[\w\.-]+@student\.42\.\w+$'
        if not re.match(student_email_pattern, email):
            return Response({"error": "Seules les adresses e-mail *@student.42.* sont autorisées via OAuth."}, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier si l'utilisateur existe déjà
        user_exists = User.objects.filter(email=email).exists()

        # Encoder l'e-mail pour l'inclure dans l'URL si nécessaire
        encoded_email = urllib.parse.quote(email)

        # Préparer la réponse avec des cookies HttpOnly
        response = HttpResponseRedirect('https://localhost:3443/#/oauth_callback')
        response.set_cookie('oauth_email', email, httponly=True, secure=True, samesite='Lax')  # `secure=True` en production
        response.set_cookie('user_exists', 'true' if user_exists else 'false', httponly=True, secure=True, samesite='Lax')

        logger.debug("OAuth callback processed, cookies set.")
        return response

class GetOAuthInfoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        email = request.COOKIES.get('oauth_email')
        user_exists = request.COOKIES.get('user_exists')

        if not email:
            return Response({"error": "Aucune information OAuth trouvée."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "email": email,
            "user_exists": user_exists == 'true'
        }, status=status.HTTP_200_OK)

class Register42View(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = Register42Serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            response = Response({
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
            # Définir les cookies HttpOnly
            response.set_cookie(
                'jwt_access_token',
                str(refresh.access_token),
                httponly=True,
                secure=True,  # Mettre à True en production
                samesite='Lax',
                path='/'
            )
            response.set_cookie(
                'jwt_refresh_token',
                str(refresh),
                httponly=True,
                secure=True,  # Mettre à True en production
                samesite='Lax',
                path='/'
            )
            logger.debug(f"User {user.username} registered via OAuth 42, JWT cookies set.")
            return response
        else:
            logger.error(f"Registration via OAuth 42 failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class Connect42View(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.COOKIES.get('oauth_email')
        if not email:
            return Response({"error": "connect42.email_missing_error"}, status=status.HTTP_400_BAD_REQUEST)

        password = request.data.get('password')

        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Préparer la réponse
            response = Response({
                'username': user.username,
                'email': user.email,
            }, status=status.HTTP_200_OK)

            # Définir les cookies
            response.set_cookie(
                'jwt_access_token',
                access_token,
                httponly=True,
                secure=True,  # Mettre à True en production
                samesite='Lax'
            )
            response.set_cookie(
                'jwt_refresh_token',
                refresh_token,
                httponly=True,
                secure=True,  # Mettre à True en production
                samesite='Lax'
            )

            # Nettoyer les cookies OAuth
            response.delete_cookie('oauth_email')
            response.delete_cookie('user_exists')

            logger.debug(f"User {user.username} connected via OAuth 42, JWT cookies set.")
            return response

        logger.warning(f"Connexion OAuth 42 échouée pour l'email {email}.")
        return Response({"error": "connect42.connection_error"}, status=status.HTTP_400_BAD_REQUEST)

class Toggle2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get("code")
        profile = request.user.profile

        totp = pyotp.TOTP(profile.generate_2fa_secret())
        if totp.verify(code):
            if profile.enabled_2fa:
                profile.secret_2fa = None
            profile.enabled_2fa = not profile.enabled_2fa
            profile.save()
            return Response({'success': True, 'two_fa_enabled': profile.enabled_2fa}, status=status.HTTP_200_OK)
        else:
            return Response({'success': False, 'two_fa_enabled': profile.enabled_2fa}, status=status.HTTP_417_EXPECTATION_FAILED)

class Status2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enabled = request.user.profile.enabled_2fa
        return Response({'is_2fa_enabled': enabled}, status=status.HTTP_200_OK)

class QRCode2FAView(APIView):
    permission_classes = [IsAuthenticated]
    renderer_classes = [StaticHTMLRenderer]

    def get(self, request):
        secret = request.user.profile.generate_2fa_secret()
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=request.user.email,
            issuer_name="Transcendence"
        )
        qr = qrcode.make(totp_uri)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        buffer.seek(0)
        return Response(buffer.getvalue(), content_type="image/png")

################################
###      Gestion du jeu      ###
################################

class GameHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        histories = GameHistory.objects.filter(user=user).order_by('-date')
        serializer = GameHistorySerializer(histories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = GameHistorySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()  # No need to pass `user`, handled in the serializer
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

################################
###     Gestion des amis     ###
################################

class AddFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """Ajoute un ami à l'utilisateur authentifié."""
        try:
            user = request.user
            user_profile = user.profile
            friend_username = request.data.get('friend_username')

            if not friend_username:
                return Response({"error": "Le nom d'utilisateur de l'ami est requis."}, status=status.HTTP_400_BAD_REQUEST)

            friend = User.objects.filter(username=friend_username).first()

            if not friend:
                return Response({"error": "Utilisateur non trouvé."}, status=status.HTTP_404_NOT_FOUND)

            friend_profile = friend.profile

            if friend == user:
                return Response({"error": "Vous ne pouvez pas vous ajouter en ami."}, status=status.HTTP_400_BAD_REQUEST)

            if friend_profile in user_profile.friends.all():
                return Response({"message": "Cet utilisateur est déjà votre ami."}, status=status.HTTP_200_OK)

            user_profile.friends.add(friend_profile)
            logger.debug(f"{friend.username} a été ajouté aux amis de {user.username}.")

            return Response({"message": f"{friend.username} a été ajouté à votre liste d'amis."}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Erreur lors de l'ajout d'un ami : {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """Supprime un ami de la liste de l'utilisateur authentifié."""
        try:
            user = request.user
            user_profile = user.profile
            friend_username = request.data.get('friend_username')

            if not friend_username:
                return Response({"error": "Le nom d'utilisateur de l'ami est requis."}, status=status.HTTP_400_BAD_REQUEST)

            friend = User.objects.filter(username=friend_username).first()

            if not friend:
                return Response({"error": "Utilisateur non trouvé."}, status=status.HTTP_404_NOT_FOUND)

            friend_profile = friend.profile

            if friend == user:
                return Response({"error": "Vous ne pouvez pas vous supprimer en ami."}, status=status.HTTP_400_BAD_REQUEST)

            if friend_profile not in user_profile.friends.all():
                return Response({"message": "Cet utilisateur n'est pas dans votre liste d'amis."}, status=status.HTTP_400_BAD_REQUEST)

            user_profile.friends.remove(friend_profile)
            logger.debug(f"{friend.username} a été supprimé des amis de {user.username}.")

            return Response({"message": f"{friend.username} a été supprimé de votre liste d'amis."}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Erreur lors de la suppression d'un ami : {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FriendListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """Affiche la liste des amis de l'utilisateur authentifié."""
        try:
            user = request.user
            user_profile = user.profile

            # Récupérer tous les amis de l'utilisateur
            friends = user_profile.friends.all()

            friends_data = UserProfileSerializer(friends, many=True, context={'request': request}).data

            return Response({"friends": friends_data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la liste des amis : {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
