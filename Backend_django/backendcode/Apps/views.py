from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from .models import Student, Administrator
from .serializer import (
    LoginSerializer,
    StudentSerializer,
    AdministratorSerializer
)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class=StudentSerializer
    
class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer

class LoginViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin):
    serializer_class = LoginSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)