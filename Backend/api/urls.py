from django.urls import path
from .views import CollegeAPIViews

urlpatterns = [
    path('start/', CollegeAPIViews.as_view(), name='start'),
]