from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/students/', include('students.urls')),
    path('api/faculty/', include('faculty.urls')),
    path('api/management/', include('management.urls')),
    path('api/tpcell/', include('tpcell.urls')),
    path('api/notifications/', include('notifications.urls')),
]
