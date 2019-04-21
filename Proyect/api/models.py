from django.db import models

# Create your models here.
class Game(models.Model):
    date = models.DateField(auto_now_add=True)
    saved_data = models.TextField()
