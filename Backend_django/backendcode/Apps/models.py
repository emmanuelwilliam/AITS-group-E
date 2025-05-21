from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
import random
import string

class UserRole(models.Model):
    # Model showing different user roles within the system
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('Lecturer', 'Lecturer'),
        ('admin', 'Administrator'),
    ]
    name = models.CharField(max_length=150, blank=True)
    role_name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    is_verified = models.BooleanField(default=False)


    class Meta:
        db_table = 'user_roles'
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'

    def __str__(self):
        return self.name

class User(AbstractUser):
    #should we have name for the user?
    role = models.ForeignKey(UserRole, on_delete=models.SET_NULL, null=True, related_name='users')
    email = models.EmailField(unique=True)
    last_login = models.DateTimeField(null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username}-{self.role.get_role_name_display() if self.role else 'No role'}"

class Student(models.Model):
    # Model representing a student profile, linked to the User model
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    college = models.CharField(max_length=100)
    student_number = models.CharField(max_length=50, unique=True)
    registration_number = models.CharField(max_length=50, unique=True)
    course = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user.username} ({self.student_number})"
   
class Lecturer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='Lecturer_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=200)
    college = models.CharField(max_length=200)
    position = models.CharField(max_length=100)
    course_units = models.ManyToManyField("CourseUnit", related_name="Lecturers")
    

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

class Status(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'), 
        ('Assigned', 'Assigned'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
        ('Pending Information', 'Pending Information'),
    ]
    
    status_name = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Open')
    last_update = models.DateTimeField(auto_now=True)
    description = models.TextField(blank=True, null=True, help_text="Optional description or notes about this status")

    def __str__(self):
        return self.status_name

    class Meta:
        verbose_name = 'Status'
        verbose_name_plural = 'Statuses'
        ordering = ['status_name']

    @classmethod
    def get_default_status(cls):
        """Get or create the default 'Open' status"""
        status, _ = cls.objects.get_or_create(
            status_name='Open',
            defaults={'description': 'Initial status when an issue is created'}
        )
        return status

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
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='Academic')
    reported_date = models.DateTimeField(auto_now_add=True)
    priority = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='Medium')
    student = models.ForeignKey(
        'Apps.User',
        on_delete=models.CASCADE,
        related_name='student_issues',
        null=True,  # Allow null temporarily for migration
        blank=True
    )
    assigned_to = models.ForeignKey(
        'Apps.User',
        null=True, 
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_issues'
    )
    status = models.ForeignKey(
        'Apps.Status',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    
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

class LoginHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    ip_address = models.GenericIPAddressField()
    login_time = models.DateTimeField(auto_now_add=True)
    session_time = models.DateTimeField()


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"Password reset token for {self.user.username}"


class EmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)

    def generate_code(self):
        # Generate a 6-digit code
        self.code = ''.join(random.choices(string.digits, k=6))
        return self.code
