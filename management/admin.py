from django.contrib import admin
from .models import ManagementEmployee

@admin.register(ManagementEmployee)
class ManagementEmployeeAdmin(admin.ModelAdmin):
    list_display = ('emp_id', 'first_name', 'last_name', 'email', 'designation')
    search_fields = ('email', 'first_name', 'last_name', 'designation')
    list_filter = ('designation',)
