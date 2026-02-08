from django.urls import path
from . import views

urlpatterns = [
    # Student endpoints
    path('student/assignments/', views.student_assignments, name='student_assignments'),
    path('student/assignments/cards/', views.student_assignment_cards, name='student_assignment_cards'),
    path('student/assignments/<int:assignment_id>/', views.student_assignment_detail, name='student_assignment_detail'),
    path('student/assignments/<int:assignment_id>/upload/', views.student_upload_assignment, name='student_upload_assignment'),
    path('student/assignments/<int:assignment_id>/download/', views.download_student_assignment, name='download_student_assignment'),
    path('student/assignments/create/<int:faculty_id>/<str:course_id>/', views.student_create_assignment, name='student_create_assignment'),
    
    # Faculty endpoints
    path('faculty/assignments/overview/', views.faculty_assignments_overview, name='faculty_assignments_overview'),
    path('faculty/assignments/pending/', views.faculty_pending_assignments, name='faculty_pending_assignments'),
    path('faculty/assignments/graded/', views.faculty_graded_assignments, name='faculty_graded_assignments'),
    path('faculty/assignments/<int:assignment_id>/', views.faculty_assignment_detail, name='faculty_assignment_detail'),
    path('faculty/assignments/<int:assignment_id>/grade/', views.faculty_grade_assignment, name='faculty_grade_assignment'),
    path('faculty/assignments/<int:assignment_id>/download/', views.download_faculty_assignment, name='download_faculty_assignment'),
]
