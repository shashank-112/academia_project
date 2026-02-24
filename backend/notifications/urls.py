from django.urls import path
from . import views
from .email_api import send_email_notification

urlpatterns = [
    path('', views.get_notifications, name='get_notifications'),
    path('send-email/', send_email_notification, name='send_email_notification'),
]
