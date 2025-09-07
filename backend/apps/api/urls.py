from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello'),
    path('crowd-data/', views.crowd_data, name='crowd_data'),
]
