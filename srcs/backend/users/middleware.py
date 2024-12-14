# users/middleware.py

from django.middleware.security import SecurityMiddleware
import logging

logger = logging.getLogger(__name__)

class ExemptMetricsSecureMiddleware(SecurityMiddleware):
    def __call__(self, request):
        if request.path.startswith('/metrics'):
            logger.debug("Exempting /metrics from SSL redirect")
            request.is_secure = lambda: True  # Indique que la requête est sécurisée
        return super().__call__(request)
