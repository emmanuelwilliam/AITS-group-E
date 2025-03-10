from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('admin', 'Administrator'),
    ]
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    email = models.EmailField(unique=True)
    phone_regex = RegexValidator(regex=r'^(?:\+256|0)?(77|78|39)(\d{7})$', message="Phone number must be in the format: '2567XXXXXXX'")
    phone_number = models.CharField(validators=[phone_regex], max_length=13, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.user_type})"

class Student(User):
    student_id = models.CharField(max_length=11, unique=True)
    reg_no = models.CharField(max_length=20, unique=True)
    program = models.CharField(max_length=100)
    year_of_study = models.IntegerField()
    department = models.CharField(max_length=100)
    
    def __str__(self):
        return self.student_id

class Lecturer(User):
    id_number = models.CharField(max_length=15, unique=True)
    employment_id = models.CharField(max_length=20, unique=True)
    position = models.CharField(max_length=50)
    department = models.CharField(max_length=100)
    courses_teaching = models.ManyToManyField('Course', blank=True)
    
    def __str__(self):
        return f"{self.username} - {self.position}"

class Administrator(User):
    admin_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    
    def __str__(self):
        return self.admin_id