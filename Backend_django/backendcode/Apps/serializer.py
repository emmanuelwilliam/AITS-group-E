from rest_framework import serializers
from .models import Student, Administrator

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Student
        fields='__all__'

class AdministratorSerializer(serializers.ModelSerializer):
    class Meta:
        model=Administrator
        fields= '__all__'