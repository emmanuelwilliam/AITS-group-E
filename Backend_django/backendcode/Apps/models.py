from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ...

# Create your models here.
class Student(User):
    student_id = models.CharField(max_length=11)
    reg_no = models.CharField(max_length=20)
    
    def __str__(self):
        return self.student_id
    

class Administrator(User):
    admin_id = models.CharField(max_length=20)
    
    def __str__(self):
        return self.admin_id
    
    
    
    