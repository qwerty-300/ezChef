from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from rest_framework.authentication import BaseAuthentication
from .models import User


class EzChefJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        user = getattr(request._request, 'user', None)
        if user and getattr(user, 'id', None) and getattr(user, 'is_authenticated', False):
            return (user, None)
        return None


class EzChefAuthBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        try:
            user = User.objects.get(username=username)
            # Check if password matches (assuming it's hashed)
            if check_password(password, user.password):
                return user
            elif user.password == password:
                return user
        except User.DoesNotExist:
            return None
        
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None