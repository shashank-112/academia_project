from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.tpcell_profile, name='tpcell_profile'),
    path('stats/', views.tpcell_stats, name='tpcell_stats'),
    path('students/', views.tpcell_get_students, name='tpcell_get_students'),
]
