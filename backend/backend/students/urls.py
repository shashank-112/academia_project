from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.student_profile, name='student_profile'),
    path('academics/', views.student_academics, name='student_academics'),
    path('backlogs/', views.student_backlogs, name='student_backlogs'),
]
