from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLES = (
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('admin', 'Administrator'),
    )
    role = models.CharField(max_length=10, choices=ROLES)

class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    department = models.CharField(max_length=100)

class Lecturer(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='lecturer_profile')
    employee_id = models.CharField(max_length=50)
    position = models.CharField(max_length=100)

class Administrator(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='admin_profile')
    contact_email = models.EmailField()

class Issue(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='issues_raised')
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE, related_name='issues_assigned')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    reported_date = models.DateTimeField(auto_now_add=True)
    priority = models.CharField(max_length=50)
    status = models.ForeignKey('Status', on_delete=models.SET_NULL, null=True)

class Notification(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    notification_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

class Status(models.Model):
    status_name = models.CharField(max_length=50)
    last_update = models.DateTimeField(auto_now=True)

class LoginHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='login_history')
    ip_address = models.GenericIPAddressField()
    login_time = models.DateTimeField(auto_now_add=True)
    session_time = models.DurationField()

class UserRole(models.Model):
    role_name = models.CharField(max_length=50)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)