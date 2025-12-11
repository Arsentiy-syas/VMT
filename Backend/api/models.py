from django.db import models
from django.core.validators import FileExtensionValidator
from django.contrib.auth.models import User


class CollegeList(models.Model):
    name = models.CharField(max_length=255)
    adress = models.CharField()
    time_create = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class FileUploads(models.Model):
    title = models.CharField(max_length=100)
    videos = models.FileField(upload_to='video/', validators=[FileExtensionValidator(
        allowed_extensions=['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
    )])
    owner = models.ForeignKey(User, related_name='videos', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title} by {self.owner.username}"
    