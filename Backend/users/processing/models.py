from django.db import models
from django.core.validators import FileExtensionValidator
from django.contrib.auth.models import User


class FileUploads(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    videos = models.FileField(upload_to='video/', validators=[FileExtensionValidator(
        allowed_extensions=['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
    )])
    owner = models.ForeignKey(User, related_name='videos', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'api_fileuploads'

    def __str__(self):
        return f"{self.title} by {self.owner.username}"
