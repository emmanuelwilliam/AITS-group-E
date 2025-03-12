from django.contrib import admin
from .models import (
        Student, 
         Administrator,
         CourseUnit,
         Issue,
         Notification,
         Status,
         LoginHistory,
)      
         

# Register your models here.
admin.site.register(Student)
admin.site.register(Administrator)
admin.site.register(CourseUnit)
admin.site.register(Issue)
admin.site.register(Notification)
admin.site.register(Status)
admin.site.register(LoginHistory)
