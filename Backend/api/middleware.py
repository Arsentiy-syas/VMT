from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

class SessionCheckMiddleware(MiddlewareMixin):
    """Middleware для проверки и обновления сессий"""
    
    def process_request(self, request):
        # Логируем информацию о сессии
        if request.path.startswith('/api/'):
            print(f"🔐 Запрос к API: {request.path}")
            print(f"👤 Пользователь: {request.user}")
            print(f"📝 Сессия: {request.session.session_key}")
            print(f"📊 Авторизован: {request.user.is_authenticated}")
        return None