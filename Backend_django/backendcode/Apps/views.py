<<<<<<< HEAD
from rest_framework import viewsets
from .models import student
from .models import Administrator
from .serializer import StudentSerializer
from .serializer import AdministratorSerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = student.object.all()
    serializer_class=StudentSerializer
    
class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.object.all()
    serializer_class = AdministratorSerializer
    
=======
from django.http import HttpResponse

# Create your views here.

def hello(request):
  return HttpResponse("Hello, Welcome to the Makerere Academic Issue Tracking System")
>>>>>>> f96cec4d295c3247fa0950c0581828ebf4eaeed1
