from datetime import datetime, timedelta
import jwt
from django.conf import settings

def generate_tokens_for_user(user):
    """Generate JWT tokens for the user"""
    access_token_expiry = datetime.utcnow() + timedelta(days=1)
    refresh_token_expiry = datetime.utcnow() + timedelta(days=7)
    
    access_payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': access_token_expiry
    }
    
    refresh_payload = {
        'user_id': user.id,
        'exp': refresh_token_expiry
    }
    
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')
    
    return {
        'access': access_token,
        'refresh': refresh_token
    }

def validate_token(token):
    """Validate JWT token and return payload if valid"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None