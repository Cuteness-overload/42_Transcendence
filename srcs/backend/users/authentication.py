# users/authentication.py

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class CookieJWTAuthentication(JWTAuthentication):
    """
    Classe d'authentification personnalisée pour extraire les tokens JWT des cookies HttpOnly.
    """

    def authenticate(self, request):
        access_token = request.COOKIES.get('jwt_access_token')
        logger.debug(f"Access token récupéré des cookies: {access_token}")

        if access_token is None:
            logger.debug("Aucun token d'accès trouvé dans les cookies.")
            return None  # Laisser d'autres méthodes d'authentification tenter de s'authentifier

        try:
            validated_token = self.get_validated_token(access_token)
            logger.debug(f"Token validé: {validated_token}")
        except InvalidToken as e:
            logger.error(f"Token invalide: {str(e)}")
            raise AuthenticationFailed('Invalid access token') from e

        user = self.get_user(validated_token)
        logger.debug(f"Utilisateur authentifié: {user}")

        return (user, validated_token)
