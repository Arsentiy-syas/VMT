from django.shortcuts import render
from django.forms.models import model_to_dict
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework import status
from .serialaizers import CollegeSerialaizers, VideoUpload
from .models import CollegeList, FileUploads


class CollegeViewset(viewsets.ViewSet):
    def list(self, request):
        college = CollegeList.objects.all()
        serialaizer = CollegeSerialaizers(college, many=True)
        return Response({
            'status': 'success',
            'data': serialaizer.data,
            'count': len(serialaizer.data),})
    
    def create(self, request):
        serializer = CollegeSerialaizers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "College created successfully",
                "data": serializer.data
            }, status=201)
        else:
            return Response({
                "status": "error",
                "errors": serializer.errors
            }, status=400)
        

@method_decorator(csrf_exempt, name='dispatch')
class WathingVideo(viewsets.ModelViewSet):
    queryset = FileUploads.objects.all()
    serializer_class = VideoUpload
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)