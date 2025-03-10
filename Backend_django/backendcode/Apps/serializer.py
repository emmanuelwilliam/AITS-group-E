from rest_framework import serializers, exceptions
from django.contrib.auth import authenticate, login
from .models import User, Student, Administrator

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Student
        fields='__all__'

class AdministratorSerializer(serializers.ModelSerializer):
    class Meta:
        model=Administrator
        fields= '__all__'
        
class LoginSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=128)
    
    def validate(self, data):
        username = data.get('username', None)
        password = data.get('password', None)
        
        if username is None:
            raise exceptions.ValidationError("Username is required")
        if password is None:
            raise exceptions.ValidationError("Password is required")
        
        user = authenticate(username=username, password=password)
        if user is None:
            exceptions.AuthenticationFailed('Invalid credentials')
            
        login(self.context.get('request', user))
        
        return {
            'id': user.pk,
            'username': user.username,
            'email': user.email,
        }
        
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']