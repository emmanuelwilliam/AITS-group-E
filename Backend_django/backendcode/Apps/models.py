from django.db import models

# Create your models here.
class student(models.Model):
    name = models.CharField(max_length=100)
    student_id = models.CharField(max_length=11)
    reg_no = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name
    

class administrator(models.Model):
    name = models.CharField(max_length=100)
    admin_id = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name
    
    
    
    