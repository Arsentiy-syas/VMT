from rest_framework import serializers
from .models import CollegeList, FileUploads


class CollegeSerialaizers(serializers.ModelSerializer):
    class Meta:
        model = CollegeList
        fields = ['name', 'adress']


class VideoUpload(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = FileUploads
        fields = ['id', 'title', 'videos', 'owner']
        read_only_fields = ['owner']