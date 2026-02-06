from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'notification_type', 'priority', 'due_date', 'created_at')
    list_filter = ('notification_type', 'priority', 'created_at')
    search_fields = ('title', 'description')
