from django.shortcuts import render
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serialaizers import CollegeSerialaizers
from .models import CollegeList




class CollegeAPIViews(generics.ListAPIView):
    queryset = CollegeList.objects.all()
    serializer_class = CollegeSerialaizers
