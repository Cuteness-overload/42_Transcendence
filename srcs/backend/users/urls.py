# users/urls.py

from django.urls import path
from .views import (
    RegisterView, CustomTokenObtainPairView, ProfileView, ResetDatabaseView,
    PasswordChangeView, VerifyJWTView, Register42View, Connect42View, LogoutView, VerifyAccessTokenFromCookie,
    OAuthCallbackView, OAuthInitiateView, GetOAuthInfoView, Toggle2FAView,
    Status2FAView, QRCode2FAView, HealthCheckView, ClearCookiesView,
    CustomTokenRefreshView,
    AddFriendView, RemoveFriendView, FriendListView, GameHistoryView
)
from rest_framework_simplejwt.views import TokenVerifyView

app_name = 'users'

urlpatterns = [
    # Health Check
    path('health/', HealthCheckView.as_view(), name='health'),

    # OAuth 42 Endpoints
    path('oauth/login/', OAuthInitiateView.as_view(), name='oauth_login'),
    path('oauth/callback/', OAuthCallbackView.as_view(), name='oauth_callback'),

    # Register via OAuth 42
    path('register42/', Register42View.as_view(), name='register42'),
    path('connect42/', Connect42View.as_view(), name='connect42'),

    # Authentication Endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify-cookie/', VerifyAccessTokenFromCookie.as_view(), name='verify_access_token_cookie'),
    path('clear-cookies/', ClearCookiesView.as_view(), name='clear_cookies'),
    path('get_oauth_info/', GetOAuthInfoView.as_view(), name='get_oauth_info'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Profile Management
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/password-change/', PasswordChangeView.as_view(), name='password_change'),

    # Resets
    path('reset/', ResetDatabaseView.as_view(), name='reset_database'),

    # Game History
    path('game-history/', GameHistoryView.as_view(), name='game_history'),

    # JWT verification / validation
    path('verify/', VerifyJWTView.as_view(), name='verifyJWT'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # 2FA status check and modification
    path('toggle2fa/', Toggle2FAView.as_view(), name='toggle_2fa'),
    path('2fa-status/', Status2FAView.as_view(), name='2fa_status'),
    path('2fa-qr-gen/', QRCode2FAView.as_view(), name='gen_2fa_qrcode'),

    # Friends Management
    path('add-friend/', AddFriendView.as_view(), name='add_friend'),
    path('delete-friend/', RemoveFriendView.as_view(), name='remove_friend'),
    path('friend-list/', FriendListView.as_view(), name='friend_list'),
]
