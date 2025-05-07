from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Student, Lecturer, Administrator, Issue, Notification, 
    Status, LoginHistory, UserRole, PasswordResetToken
)

# Authentication Serializers
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
                    raise serializers.ValidationError("User account is disabled.")
                return data  # Return the validated data instead of user
            raise serializers.ValidationError("Unable to log in with provided credentials.")
        raise serializers.ValidationError("Must include 'username' and 'password'.")


class UserRegistrationSerializer(serializers.Serializer):
    # User fields
    username           = serializers.CharField()
    email              = serializers.EmailField()
    password           = serializers.CharField(write_only=True)
    confirm_password   = serializers.CharField(write_only=True)
    first_name         = serializers.CharField()
    last_name          = serializers.CharField()
    # Student fields
    college            = serializers.CharField()
    student_number     = serializers.CharField()
    registration_number= serializers.CharField()
    course             = serializers.CharField()

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Username already taken.")
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already registered.")
        return data

    def create(self, validated_data):
        # 1) Pop student fields
        college            = validated_data.pop('college')
        student_number     = validated_data.pop('student_number')
        registration_number= validated_data.pop('registration_number')
        course             = validated_data.pop('course')
        validated_data.pop('confirm_password')

        # 2) Get or create student role
        student_role, _ = UserRole.objects.get_or_create(
            role_name='student',
            defaults={'name': 'Student'}
        )

        # 3) Create User
        user = User(
            username   = validated_data['username'],
            email      = validated_data['email'],
            first_name = validated_data['first_name'],
            last_name  = validated_data['last_name'],
            role       = student_role,
            is_active  = False,  # pending email verification
        )
        user.set_password(validated_data['password'])
        user.save()

        # 4) Create Student profile
        Student.objects.create(
            user               = user,
            college            = college,
            student_number     = student_number,
            registration_number= registration_number,
            course             = course
        )

        return user

# Email Verification Serializer
class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField(max_length=50)

# By default nested serializers are read-only. If you want to support 
# write-operations to a nested serializer field you'll need to create
# create() and/or update() methods in order to explicitly specify how
# the child relationships should be saved:
class UsializeerRoleSerializer(serrs.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', 'role_name']
        
# Model Serializers
class UserSerializer(serializers.ModelSerializer):
    role = UserRoleSerializer(read_only=True)
    role_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'role_name']
    
    def create(self, validated_data):
        role_name = validated_data.pop('role_name', None)
        password = validated_data.pop('password')

        # Handle role assignment if necessary
        if role_name:
            role = UserRole.objects.get(role_name=role_name)
            validated_data['role'] = role

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# Profile Serializers
class StudentSerializer(serializers.ModelSerializer):
      user = UserSerializer()

      class Meta:
          model = Student
          fields = ['user', 'college', 'course', 'student_number', 'registration_number']
  
      def create(self, validated_data):
          user_data = validated_data.pop('user')
          user_data['role_name'] = 'student'  # Force role to student
      
          # Use UserSerializer to create the user correctly
          user_serializer = UserSerializer(data=user_data)
          user_serializer.is_valid(raise_exception=True)
          user = user_serializer.save()
      
          student = Student.objects.create(user=user, **validated_data)
          return student


      def validate_student_number(self, value):
          if Student.objects.filter(student_number=value).exists():
              raise serializers.ValidationError("Student number already exists. Please provide a unique student number.")
          return value

# Serializer for the Lecturer model, including a nested UserSerializer with a depth of 1.
class LecturerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
       model = Lecturer
       fields ='__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role_name'] = 'lecturer'  # Force role
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()
        lecturer = Lecturer.objects.create(user=user, **validated_data)
        return lecturer

class AdministratorSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Administrator
        fields = '__all__'
        depth = 1

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role_name'] = 'administrator'  # Force role

        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        administrator = Administrator.objects.create(user=user, **validated_data)
        return administrator


# Issue Tracking Serializers
class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

# Serializer for handling issue data, including related student, Lecturer, and status information.
class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = [
            'title', 'description', 'college', 'program', 
            'year_of_study', 'semester', 'course_unit', 
            'course_code', 'category', 'priority'
        ]
        extra_kwargs = {
            'title': {'required': True},
            'description': {'required': True},
            'college': {'required': True},
            'program': {'required': True},
            'year_of_study': {'required': True},
            'semester': {'required': True},
            'course_unit': {'required': True},
            'course_code': {'required': True},
        }

# Serializer for Notification model with related issue data.
class NotificationSerializer(serializers.ModelSerializer):
    issue = IssueSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at']

class LoginHistorySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = LoginHistory
        fields = '__all__'
        read_only_fields = ['login_time']

# Password Reset Serializers
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return value

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email doesn't exist.")

    def validate(self, attrs):
        if 'email' not in attrs or 'password' not in attrs:
            raise serializers.ValidationError("Both email and password are required.")
        return attrs

    def save(self):
        email = self.validated_data['email']
        new_password = self.validated_data['password']
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            LoginHistory.objects.create(user=user)
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Error resetting password: {str(e)}")

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return value

    def save(self):
        token = self.validated_data['token']
        new_password = self.validated_data['new_password']

        try:
            password_reset_token = PasswordResetToken.objects.get(token=token)
            user = password_reset_token.user

            if password_reset_token.is_expired:
                raise serializers.ValidationError("This token has expired.")

            user.set_password(new_password)
            user.save()
            LoginHistory.objects.create(user=user)
            return user

        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired token.")
        except Exception as e:
            raise serializers.ValidationError(f"Error resetting password: {str(e)}")
