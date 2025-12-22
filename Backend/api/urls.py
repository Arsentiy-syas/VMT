from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollegeViewset, WathingVideo


router = DefaultRouter()
router.register('collegelist', CollegeViewset, basename='college')
router.register('wathingvid', WathingVideo, basename='wathing')

urlpatterns = [
    path('v1/', include(router.urls)),
]