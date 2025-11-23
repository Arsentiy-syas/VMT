from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollegeViewset

router = DefaultRouter()
router.register('collegelist', CollegeViewset, basename='college')

urlpatterns = [
    path('v1/', include(router.urls)),
]