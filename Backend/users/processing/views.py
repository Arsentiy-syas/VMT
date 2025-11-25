from django.shortcuts import render
from django.forms.models import model_to_dict
from rest_framework import viewsets
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serialaizers import RegistrationSerialaizer


class RegistrationViewset(viewsets.ViewSet):
    def create(self, request):
        serialaizer = RegistrationSerialaizer(data=request.data)
        if serialaizer.is_valid():
            serialaizer.save()
            return Response({'status': 'success', 'message': 'Пользователь успешно зарегестрирован'},
                            status=status.HTTP_201_CREATED)
        return Response(serialaizer.errors, status=status.HTTP_400_BAD_REQUEST)
