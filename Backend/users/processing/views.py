from django.shortcuts import render
from django.contrib.auth import logout
from django.contrib.auth import authenticate, login
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework import status
from .serialaizers import RegistrationSerialaizer, ProfileUserSerialaizer


@method_decorator(csrf_exempt, name='dispatch')
class RegistrationViewset(viewsets.ViewSet):
    def create(self, request):
        serialaizer = RegistrationSerialaizer(data=request.data)
        if serialaizer.is_valid():
            serialaizer.save()
            return Response({'status': 'success', 'message': 'Пользователь успешно зарегестрирован'},
                            status=status.HTTP_201_CREATED)
        return Response(serialaizer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@method_decorator(csrf_exempt, name='dispatch')
class ProfileUser(viewsets.ViewSet):
    permission_class=[IsAuthenticated]

    @action(detail=False, methods=['GET'])
    def profile(self, request):
        serializer = ProfileUserSerialaizer(request.user)

        return Response({'status': 'success', 'data': serializer.data})
    

@method_decorator(csrf_exempt, name='dispatch')
class LogoutViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        try:
            if hasattr(request, 'session'):
                request.session.flush()
                request.session.delete()
            
            logout(request)
            
            response = Response({
                'status': 'success',
                'message': 'Успешный выход из аккаунта',
            }, status=status.HTTP_200_OK)
            
            response.delete_cookie('sessionid')
            response.delete_cookie('csrftoken')
            
            response['Authorization'] = ''
            
            return response
            
        except Exception as e:
            print(f"Ошибка при выходе: {e}")
            return Response({
                'status': 'error',
                'message': 'Ошибка при выходе'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
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
            request.session.save()
        
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
