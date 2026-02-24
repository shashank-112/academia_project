from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings

@api_view(['POST'])
@permission_classes([AllowAny])
def send_email_notification(request):
    """
    Send an email notification using sender configured in settings.py.
    Expects JSON: { "to": "recipient@email.com", "subject": "...", "message": "..." }
    """
    data = request.data
    to_email = data.get('to')
    subject = data.get('subject')
    message = data.get('message')

    if not to_email or not subject or not message:
        return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # DEBUG: Print loaded email settings
        print('EMAIL_HOST_USER:', settings.EMAIL_HOST_USER)
        print('EMAIL_HOST_PASSWORD:', settings.EMAIL_HOST_PASSWORD)
        print('DEFAULT_FROM_EMAIL:', settings.DEFAULT_FROM_EMAIL)
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [to_email],
            fail_silently=False,
        )
        return Response({"success": True, "sent_to": to_email}, status=status.HTTP_200_OK)
    except Exception as e:
        print('EMAIL SEND ERROR:', e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
