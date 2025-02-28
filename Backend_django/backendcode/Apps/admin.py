from django.contrib import admin
from .models import student
from .models import administrator

# Register your models here.
admin.site.register(student)
admin.site.register(administrator)
