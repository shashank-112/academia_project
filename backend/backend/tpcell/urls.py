from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.tpcell_profile, name='tpcell_profile'),
]
