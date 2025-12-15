from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FileUploads

class RegistrationSerialaizer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Пароли не сходятся!'})
            
        return attrs
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user


class VideoUpload(serializers.ModelSerializer):
    # owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = FileUploads
        fields = ['id', 'title', 'videos', 'owner']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['owner'] = user
        return super().create(validated_data)
    

class ProfileUserSerialaizer(serializers.ModelSerializer):
    user_videos = VideoUpload(source='fileuploads_set', many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'user_videos']