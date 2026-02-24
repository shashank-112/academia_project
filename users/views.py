from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer
from utils.password_utils import verify_password
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def login(request):
    """
    Login endpoint that accepts email, password, and role
    Returns JWT tokens and user data
    
    SECURITY: This endpoint now:
    1. Verifies against User model (which has hashed passwords)
    2. If User password check fails, it can also verify against model-specific passphrases
       (for backward compatibility during migration)
    3. Uses constant-time comparison to prevent timing attacks
    """
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role')
    
    if not email or not password or not role:
        return Response(
            {'error': 'Email, password, and role are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email, role=role)
    except User.DoesNotExist:
        logger.warning(f"Login attempt with non-existent user: {email} (role: {role})")
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Verify password using Django's secure password verification
    # This uses constant-time comparison to prevent timing attacks
    if not user.check_password(password):
        logger.warning(f"Failed login attempt for user: {email} (role: {role})")
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    logger.info(f"✓ Successful login for user: {email} (role: {role})")
    
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': UserSerializer(user).data,
    }, status=status.HTTP_200_OK)
