from django.contrib import admin
from .models import Assignment


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = (
        'assignment_id', 'student', 'faculty', 'course_id',
        'status', 'submitted_at', 'marks_awarded', 'graded_at'
    )
    list_filter = (
        'course_id', 'marks_awarded', 'submitted_at', 'graded_at', 'created_at'
    )
    search_fields = (
        'student__student_id', 'student__first_name', 'student__last_name',
        'faculty__faculty_id', 'faculty__first_name', 'faculty__last_name',
        'course_id'
    )
    readonly_fields = ('created_at', 'updated_at', 'status')
    fieldsets = (
        ('Assignment Info', {
            'fields': ('assignment_id', 'student', 'faculty', 'course_id')
        }),
        ('Student Details', {
            'fields': ('year_id', 'branch_id', 'section_id')
        }),
        ('Submission', {
            'fields': ('assignment_pdf', 'submitted_at')
        }),
        ('Grading', {
            'fields': ('marks_awarded', 'graded_at')
        }),
        ('Metadata', {
            'fields': ('status', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def status(self, obj):
        """Display status color-coded"""
        status_colors = {
            'not_submitted': '🔴 Not Submitted',
            'submitted': '🟡 Submitted',
            'graded': '🟢 Graded'
        }
        return status_colors.get(obj.status, obj.status)
