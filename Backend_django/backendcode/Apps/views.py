from rest_framework import viewsets
from .models import student, Administrator
from .serializer import StudentSerializer,AdministratorSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = student.object.all()
    serializer_class=StudentSerializer
    
class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.object.all()
    serializer_class = AdministratorSerializer
    