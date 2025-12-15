from rest_framework import serializers
from .models import CollegeList, FileUploads


class CollegeSerialaizers(serializers.ModelSerializer):
    class Meta:
        model = CollegeList
        fields = ['name', 'adress']


class VideoUpload(serializers.ModelSerializer):
    # owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = FileUploads
        fields = ['id', 'title', 'videos']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)