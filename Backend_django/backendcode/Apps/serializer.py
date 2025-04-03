from rest_framework import serializers
from .models import User, Student, Lecturer, Administrator, Issue, Notification, Status, LoginHistory, UserRole
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role']

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Student
        fields = '__all__'

class LecturerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Lecturer
        fields = '__all__'

class AdministratorSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Administrator
        fields = '__all__'

class IssueSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    lecturer = LecturerSerializer(read_only=True)
    status = serializers.StringRelatedField()
    class Meta:
        model = Issue
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    issue = IssueSerializer(read_only=True)
    class Meta:
        model = Notification
        fields = '__all__'

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

class LoginHistorySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = LoginHistory
        fields = '__all__'

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email','password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate_password(self, value):
        validate_password(value)
        return value
    
class VerifyEmailSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled")
                return user
            raise serializers.ValidationError("Unable to log in with the provided information.")
        raise serializers.ValidationError("Must include 'username' and 'password'.")
    