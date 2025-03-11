from django.contrib import admin
from .models import Student, Administrator,CourseUnit

# Register your models here.
admin.site.register(Student)
admin.site.register(Administrator)
admin.site.register(CourseUnit)
