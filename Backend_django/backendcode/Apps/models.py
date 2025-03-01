from django.db import models
from Apps.models import Student, Administrato

# Create your models here.
class Student(models.Model):
    name = models.CharField(max_length=100)
    student_id = models.CharField(max_length=11)
    reg_no = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name
    

class Administrator(models.Model):
    name = models.CharField(max_length=100)
    admin_id = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name
    
    
    
    