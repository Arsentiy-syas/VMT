from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegistrationViewset


router = DefaultRouter()
router.register(r'registration', RegistrationViewset, basename='registration')


urlpatterns = [
    path('admin/', admin.site.urls),
] + router.urls