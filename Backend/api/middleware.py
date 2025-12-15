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
    

class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Добавляем заголовки CORS для всех ответов
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "content-type, accept, x-csrftoken, x-user-id, x-username, x-auth-token, cookie, authorization"
        response["Access-Control-Max-Age"] = "86400"  # 24 часа
        
        return response

    def process_exception(self, request, exception):
        print(f"CORS Middleware Exception: {exception}")
        return None