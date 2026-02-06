from django.contrib import admin
from .models import Faculty, FacultyAssignment

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('faculty_id', 'first_name', 'last_name', 'email', 'department', 'designation')
    search_fields = ('email', 'first_name', 'last_name', 'department')
    list_filter = ('department', 'designation')

@admin.register(FacultyAssignment)
class FacultyAssignmentAdmin(admin.ModelAdmin):
    list_display = ('faculty', 'year_id', 'branch_id', 'section_id', 'course_id')
    list_filter = ('year_id', 'branch_id')
