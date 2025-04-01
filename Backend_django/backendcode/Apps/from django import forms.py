from django import forms
from .models import Issue, Notification, Student, Lecturer, CourseUnit, Administrator, Status
from django.core.validators import EmailValidator
from django.utils import timezone
from django.core.exceptions import ValidationError

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ['user', 'college']
        
    def clean_user(self):
        """Ensure student email follows Makerere format"""
        user_email = self.cleaned_data['user'].email.lower()
        if not user_email.endswith('@mak.ac.ug'):
            raise ValidationError('Student email must be from Makerere University (@mak.ac.ug)')
        return self.cleaned_data['user']

class LecturerForm(forms.ModelForm):
    class Meta:
        model = Lecturer
        fields = ['user', 'department', 'employee_id', 'position', 'course_units']
        
   def clean_employee_id(self):
        """ Validate employee ID format"""
        employee_id = self.cleaned_data['employee_id'].upper()
        if not employee_id.startswith('LEC'):
            raise ValidationError('Employee ID must start with LEC')
        return employee_id

class AdministratorForm(forms.ModelForm):
    contact_email = forms.EmailField(validators=[EmailValidator()])
    
    class Meta:
        model = Administrator
        fields = ['user', 'contact_email']
        
    def clean_contact_email(self):
        """Ensure admin email follows Makerere format"""
        email = self.cleaned_data['contact_email'].lower()
        if not email.endswith('@adm.mak.ac.ug'):
            raise ValidationError('Administrator email must be from Makerere admin domain')
        return email

class IssueForm(forms.ModelForm):
    reported_date = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        required=True
    )
    description = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 4, 'class': 'form-control'}),
        required=True
    )
    
    class Meta:
        model = Issue
        fields = [
            'student',
            'lecturer',
            'title',
            'description',
            'category',
            'reported_date',
            'priority',
            'status'
        ]
        
    def clean_reported_date(self):
        """Validate reported date"""
        reported_date = self.cleaned_data.get('reported_date')
        if reported_date and reported_date > timezone.now().date():
            raise ValidationError('Reported date cannot be in the future')
        return reported_date
        
    def clean_title(self):
        """Validate issue title"""
        title = self.cleaned_data.get('title').strip()
        prohibited_words = ['stupid', 'liar', 'advertisement', 'fake']
        if any(word in title.lower() for word in prohibited_words):
            raise ValidationError('Title contains prohibited words.')
        return title
        
    def clean_description(self):
        """Validate issue description"""
        description = self.cleaned_data.get('description').strip()
        if len(description) < 20:
            raise ValidationError('Description must be at least 20 characters long')
        return description

class NotificationForm(forms.ModelForm):
    class Meta:
        model = Notification
        fields = ['issue', 'message', 'is_read', 'notification_type', 'created_at']
        
    def clean_message(self):
        """Validate notification message length"""
        message = self.cleaned_data['message'].strip()
        if len(message) < 10:
            raise ValidationError('Notification message must be at least 10 characters long')
        return message

class StatusForm(forms.ModelForm):
    class Meta:
        model = Status
        fields = ['status_name', 'last_update']
        
    def clean_status_name(self):
        """Validate status name format"""
        status_name = self.cleaned_data['status_name'].strip()
        if not status_name.upper().startswith('ISSUE'):
            raise ValidationError('Status must start with ISSUE')
        return status_name

class CourseUnitForm(forms.ModelForm):
    class Meta:
        model = CourseUnit
        fields = ['course_code', 'course_name']
        
    def clean_course_code(self):
        """Validate course code format"""
        course_code = self.cleaned_data['course_code']
        # Check alphanumeric nature
        if not course_code.isalnum():
            raise forms.ValidationError('Course code must contain only letters and numbers')
            
        # Check length
        if len(course_code) != 7:
            raise forms.ValidationError('Course code must be exactly 7 characters long')
            
        # Check spaces
        if ' ' in course_code:
            raise forms.ValidationError('Course code must not contain spaces')
            
        return course_code
        
    def clean_course_name(self):
        """Validate course name format"""
        course_name = self.cleaned_data['course_name'].strip()
        if not all(char.isalpha() or char.isspace() for char in course_name):
            raise forms.ValidationError("Course name must contain only letters and spaces")
        return course_name