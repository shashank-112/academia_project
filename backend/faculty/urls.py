from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.faculty_profile, name='faculty_profile'),
    path('assignments/', views.faculty_assignments, name='faculty_assignments'),
]
