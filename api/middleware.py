from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from .jwt_utils import validate_token
from .models import User


class DisableAPICSRFMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None


class JWTAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/api/auth/') or not request.path.startswith('/api/'):
            return None

        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        payload = validate_token(token)

        if payload:
            try:
                request.user = User.objects.get(id=payload['user_id'])
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=401)
        else:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        return None