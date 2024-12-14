# users/utils.py

from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    # Appeler le gestionnaire d'exceptions standard pour obtenir une réponse initiale
    response = exception_handler(exc, context)

    # Si une réponse est générée et que le statut est 401 (Unauthorized)
    if response is not None and response.status_code == 401:
        # Supprimer les cookies JWT
        response.delete_cookie('jwt_access_token', path='/')
        response.delete_cookie('jwt_refresh_token', path='/')
        # Optionnellement, vous pouvez ajouter un message ou un header
        response.data = {"detail": "Identifiants invalides. Veuillez vous reconnecter ou vous inscrire."}

    return response
