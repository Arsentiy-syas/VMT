from rest_framework import serializers
from .models import CollegeList


class CollegeSerialaizers(serializers.ModelSerializer):
    class Meta:
        model = CollegeList
        fields = ('name', 'adress')