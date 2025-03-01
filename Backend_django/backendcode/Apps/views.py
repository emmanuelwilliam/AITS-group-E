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
    
