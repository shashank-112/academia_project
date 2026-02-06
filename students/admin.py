from django.contrib import admin
from .models import Student, StudentAcademic, StudentBacklog

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'first_name', 'last_name', 'email', 'year_id')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('year_id', 'branch_id', 'sec_id')

@admin.register(StudentAcademic)
class StudentAcademicAdmin(admin.ModelAdmin):
    list_display = ('student', 'semester_id', 'course_code', 'marks')
    list_filter = ('semester_id',)

@admin.register(StudentBacklog)
class StudentBacklogAdmin(admin.ModelAdmin):
    list_display = ('student', 'semester_id', 'course_id')
