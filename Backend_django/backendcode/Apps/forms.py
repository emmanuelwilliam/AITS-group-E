from django import forms
from .models import Issue, Notification, Student, Lecturer, CourseUnit, Administrator, Status

#form for the student model
class StudentForm(forms.ModelForm):
  class Meta:
    model = Student
    fields = [
      'user',
      'college',
    ]

#form for lecturer model
class LecturerForm(forms.ModelForm):
  class Meta:
    model = Lecturer
    fields = [
      'user',
      'department',
      'employee_id',
      'position',
      'course_units',
    ]

#form for Admin model
class AdministratorForm(forms.ModelForm):
  class Meta:
    model = Lecturer
    fields = [
      'user',
      'contact_email',
    ]

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

#form for Notification model
class NotificationForm(forms.ModelForm):
  class Meta:
    model = Notification
    fields = [
      'issue',
      'message',
      'is_read',
      'notification_type',
      'created_at',
    ]
      
#form for Status
class StatusForm(forms.ModelForm):
  class Meta:
    model = Notification
    fields = [
      'status_name',
      'last_update',
    ]

#form for CourseUnit
class CourseUnitForms(forms.ModelForm):
  class Meta :
    model = CourseUnit
    fields = [
      'course_code',
      'course_name',
    ]
