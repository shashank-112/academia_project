from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from backend.notifications.email_api import send_email_notification

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/students/', include('students.urls')),
    path('api/faculty/', include('faculty.urls')),
    path('api/management/', include('management.urls')),
    path('api/tpcell/', include('tpcell.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/assignments/', include('assignments.urls')),
    path('api/send-email/', send_email_notification, name='send_email_notification'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
