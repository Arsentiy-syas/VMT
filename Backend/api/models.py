from django.db import models


class CollegeList(models.Model):
    name = models.CharField(max_length=255)
    adress = models.CharField()
    time_create = models.DateTimeField(auto_now_add=True)
    