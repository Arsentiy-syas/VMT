from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollegeViewset, WathingVideo
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return Response({
        'csrfToken': get_token(request)
    })


router = DefaultRouter()
router.register('collegelist', CollegeViewset, basename='college')
router.register('wathingvid', WathingVideo, basename='wathing')

urlpatterns = [
    path('v2/csrf/', get_csrf_token, name='get_csrf_token'),
    path('v1/', include(router.urls)),
]