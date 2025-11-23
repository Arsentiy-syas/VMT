from rest_framework import serializers
from .models import CollegeList


class CollegeSerialaizers(serializers.Serializer):
    name = serializers.CharField()
    adress = serializers.CharField()
    time_create = serializers.DateTimeField()