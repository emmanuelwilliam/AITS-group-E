from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.Model):
    ROLE_CHOICES=[
        ('student','Student'),
        ('lecturer','Lecturer'),
        ('admin','Administrator'),
    ]
    role_name = models.CharField(max_length=50,unique=True, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.role_name_display()
    
class CustomUser(AbstractUser):
    role = models.ForeignKey(UserRole,on_delete=models.SET_NULL,null=True,related_name='users')
 
    def __str__(self):
        return f"{self.username}-{self.role.get_role_name_diplay() if self.role else 'No role'}"

class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    college = models.CharField(max_length=100)

class Lecturer(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='lecturer_profile')
    employee_id = models.CharField(max_length=50)
    """
    Having a position here seems weird but we are trying 
    to distinguish between assistant lecturers, junior lecturers , senior lecturers 
    thus the position prompt
    """
    position = models.CharField(max_length=100)
    course_units = models.ManytoManyField("CourseUnit",related_name="lecturers")

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.position if self.position else 'Lecturer'}"

class CourseUnit(models.Model):
    course_code = models.CharField(max_length=8, unique=True)
    course_name = models.CharField(max_length=30)

    def __str__(self):
        return f"{self.course_code}-{self.course_name}"
    
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
    NOTIFICATION_TYPES = (
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    )
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.issue.title} ({self.notification_type})"

class Status(models.Model):
    status_name = models.CharField(max_length=50)
    last_update = models.DateTimeField(auto_now=True)

class LoginHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='login_history')
    ip_address = models.GenericIPAddressField()
    login_time = models.DateTimeField(auto_now_add=True)
    session_time = models.DurationField()

