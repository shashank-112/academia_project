from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.management_profile, name='management_profile'),
]
