from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.management_profile, name='management_profile'),
    path('students/', views.get_all_students, name='management_students'),
    path('students/count/', views.get_student_count, name='management_students_count'),
    path('faculty/', views.get_all_faculty, name='management_faculty'),
    path('faculty/count/', views.get_faculty_count, name='management_faculty_count'),
    path('fees/summary/', views.get_fee_summary, name='management_fees_summary'),
    path('fees/stats/', views.get_fee_stats, name='management_fees_stats'),
    path('fees/details/', views.get_student_fee_details, name='management_fees_details'),
    path('notifications/recent/', views.recent_notifications, name='management_notifications_recent'),
]
