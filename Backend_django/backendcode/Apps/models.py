from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class UserRole(models.Model):
    ROLE_CHOICES=[
        ('student','Student'),
        ('lecturer','Lecturer'),
        ('admin','Administrator'),
    ]
    role_name = models.CharField(max_length=50,unique=True, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.get_role_name_display()

class User(AbstractUser):
    name = models.CharField(max_length=150, blank=True)
    role = models.ForeignKey(UserRole, on_delete=models.SET_NULL, null=True, related_name='users')
    email = models.EmailField(unique=True)
    last_login = models.DateTimeField(null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username}-{self.role.get_role_name_display() if self.role else 'No role'}"

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    college = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

class Lecturer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lecturer_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=200)
    college = models.CharField(max_length=200)
    position = models.CharField(max_length=100)
    course_units = models.ManyToManyField("CourseUnit", related_name="lecturers")
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.position if self.position else 'Lecturer'}"

class Administrator(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    contact_email = models.EmailField(unique=True)

class CourseUnit(models.Model):
    course_code = models.CharField(max_length=8, unique=True)
    course_name = models.CharField(max_length=30)

    def __str__(self):
        return f"{self.course_code}-{self.course_name}"

class Issue(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    ]
    
    CATEGORY_CHOICES = [
        ('Academic', 'Academic'),
        ('Discipline', 'Discipline'),
        ('Financial', 'Financial'),
        ('Other', 'Other'),
    ]
    
    SEMESTER_CHOICES = [
        ('1', 'First Semester'),
        ('2', 'Second Semester'),
        ('3', 'Third Semester'),
    ]

    YEAR_OF_STUDY_CHOICES = [
        ('1', 'First Year'),
        ('2', 'Second Year'),
        ('3', 'Third Year'),
        ('4', 'Fourth Year'),
    ]

    # Required fields from the form
    title = models.CharField(max_length=255)
    description = models.TextField()
    college = models.CharField(max_length=100)
    program = models.CharField(max_length=100)
    year_of_study = models.CharField(max_length=1, choices=YEAR_OF_STUDY_CHOICES)
    semester = models.CharField(max_length=1, choices=SEMESTER_CHOICES)
    course_unit = models.CharField(max_length=100)
    course_code = models.CharField(max_length=20)
    # System fields
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='issues_raised')
    assigned_to = models.CharField(max_length=100, null=True, blank=True)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='Academic')
    reported_date = models.DateTimeField(auto_now_add=True)
    priority = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='Medium')
    status = models.ForeignKey('Status', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.student}"

    class Meta:
        ordering = ['-reported_date']

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

    def __str__(self):
        return self.status_name

class LoginHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    ip_address = models.GenericIPAddressField()
    login_time = models.DateTimeField(auto_now_add=True)
    session_time = models.DurationField()


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"Password reset token for {self.user.username}"