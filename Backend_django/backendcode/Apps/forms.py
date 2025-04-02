from django import forms
from django.db import models
from .models import Issue, Notification, Student, Lecturer, CourseUnit, Administrator, Status
from django.core.validators import EmailValidator
from django.utils import timezone
from django.core.exceptions import ValidationError

#form for the student model
class StudentForm(forms.ModelForm):
  class Meta:
    model = Student
    fields = [ 
      'user',
      'college',
    ]
  def clean_user(self):
        """Ensure student email follows Makerere format"""
        user_email = self.cleaned_data['user'].email.lower()
        if not user_email.endswith('@mak.ac.ug'):
            raise ValidationError('Student email must be from Makerere University (@mak.ac.ug)')
        return self.cleaned_data['user']

#form for lecturer model
class LecturerForm(forms.ModelForm):
    class Meta:
      model = Lecturer
      fields = [
        'user',
        'email',
        'college',
        'department',
        'employee_id',
        'position',
        'course_units',
      ]
    def clean_employee_id(self):
        """Validate employee ID format"""
        employee_id = self.cleaned_data['employee_id'].upper()
        if not employee_id.startswith('LEC'):
            raise ValidationError('Employee ID must start with LEC')
        return employee_id     

#form for Admin model
class AdministratorForm(forms.ModelForm):
    contact_email = forms.EmailField(validators=[EmailValidator()])
  
    class Meta:
      model = Administrator
      fields = [
        'user',
        'contact_email',
      ]
      
    def clean_contact_email(self):
        """Ensure admin email follows Makerere format"""
        email = self.cleaned_data['contact_email'].lower()
        if not email.endswith('@adm.mak.ac.ug'):
            raise ValidationError('Administrator email must be from Makerere admin domain')
        return email    

#form for Issue model
class IssueForm(forms.ModelForm):
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
        'status',
      ]
  reported_date = forms.DateField(
      widget = forms.DateInput(attrs={'type':'date' , 'class': 'form-control'}),
      required = True
  )
  description = forms.CharField(
      widget = forms.Textarea(attrs={'rows': 4, 'class':'form-control'}),
      required = True
  )    
  def clean_reported_date(self):
    reported_date = self.cleaned_data.get('reported_date')
    if reported_date and reported_date > timezone.now().date():
        raise ValidationError('Reported date is not current')
    return reported_date
    
  def clean_title(self):
    title = self.cleaned_data.get('title').strip()
    prohibited_words = ['stupid','liar','advertisement','fake']
    if any(word in title.lower() for word in prohibited_words):
        raise ValidationError('Title contains prohibited words.')
    return title
  
  def clean_description(self):
        """Validate issue description"""
        description = self.cleaned_data.get('description').strip()
        if len(description) < 20:
            raise ValidationError('Description must be at least 20 characters long')
        return description  

#form for Notification model
class NotificationForm(forms.ModelForm):
    class Meta:
      model = Notification
      fields = '__all__' 
      created_at = models.DateTimeField(auto_now_add=True)
     
    def clean_message(self):
        """Validate notification message length"""
        message = self.cleaned_data['message'].strip()
        if len(message) < 10:
            raise ValidationError('Notification message must be at least 10 characters long')
        return message
     
        
#form for Status
class StatusForm(forms.ModelForm):
      last_update = forms.CharField(disabled=True)
      class Meta:
        model = Status
        fields = '__all__'
      
      def clean_status_name(self):
        """Validate status name format"""
        status_name = self.cleaned_data['status_name'].strip()
        if not status_name.upper().startswith('ISSUE'):
            raise ValidationError('Status must start with ISSUE')
        return status_name
        
        
#form for CourseUnit
class CourseUnitForm(forms.ModelForm):
    class Meta :
      model = CourseUnit
      fields = [
        'course_code',
        'course_name',
      ]
      
    def clean_course_code(self):
        course_code = self.cleaned_data['course_code']
        #Checks whether the course_code is alphanumeric in nature
        if not course_code.isalnum():
            raise forms.ValidationError('Course code must not contain any special characters, only numbers and letters')
        #Checks whether the length of the course code is 7
        if len(course_code) != 7:
            raise forms.ValidationError('The code must have only 7 characters')
        #Checks for spaces in the course code
        if ' ' in course_code:
            raise forms.ValidationError('The course code must not contain any spaces')
        return course_code
  
    def clean_course_name(self):
        course_name = self.cleaned_data['course_name'].strip()
        #checks if the course name contains only spaces and letters
        if not all(char.isalpha() or char.isspace() for char in course_name):
            raise forms.ValidationError("Course name must have only letters and spaces")
        return course_name
