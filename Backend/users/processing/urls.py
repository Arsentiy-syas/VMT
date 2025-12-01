from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegistrationViewset, ProfileUser, user_logout, LoginViewSet


router = DefaultRouter()
router.register(r'registration', RegistrationViewset, basename='registration')
router.register(r'profile', ProfileUser, basename='profile')
router.register(r'login', LoginViewSet, basename='login')


urlpatterns = [
    path('api/v2/', include(router.urls)),
    path('api/logout', user_logout, name='logout'),
]