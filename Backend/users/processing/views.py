from django.shortcuts import render
from django.contrib.auth import logout
from django.contrib.auth import authenticate, login
from django.forms.models import model_to_dict
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework import status
from .serialaizers import RegistrationSerialaizer, ProfileUserSerialaizer


class RegistrationViewset(viewsets.ViewSet):
    def create(self, request):
        serialaizer = RegistrationSerialaizer(data=request.data)
        if serialaizer.is_valid():
            serialaizer.save()
            return Response({'status': 'success', 'message': 'Пользователь успешно зарегестрирован'},
                            status=status.HTTP_201_CREATED)
        return Response(serialaizer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ProfileUser(viewsets.ViewSet):
    permission_class=[IsAuthenticated]

    @action(detail=False, methods=['GET'])
    def profile(self, request):
        serializer = ProfileUserSerialaizer(request.user)

        return Response({'status': 'success', 'data': serializer.data})
    

@api_view(['POST'])
@permission_classes([AllowAny])
def user_logout(request):
    if request.user.is_authenticated:
        logout(request)
        
        request.session.flush()
        
        request.session.create()

        return Response({
            'status': 'success',
            'message': 'Успешный выход из аккаунта',
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'status': 'error',
            'message': 'Пользователь не зарегистрирован',
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({
                'status': 'error',
                'message': 'Укажите имя пользователя и пароль',
            }, status=status.HTTP_400_BAD_REQUEST)
    
        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
        
            return Response({
                'status': 'success',
                'message': 'Успешный вход',
                'user': {
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'error',
                'message': 'Неверные учетные данные'
            }, status=status.HTTP_401_UNAUTHORIZED)
