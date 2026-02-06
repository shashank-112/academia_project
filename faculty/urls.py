from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.faculty_profile, name='faculty_profile'),
    path('assignments/', views.faculty_assignments, name='faculty_assignments'),
    path('students/', views.faculty_students, name='faculty_students'),
]
