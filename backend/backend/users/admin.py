from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'first_name', 'last_name')
    list_filter = ('role',)
    search_fields = ('email', 'first_name', 'last_name')
