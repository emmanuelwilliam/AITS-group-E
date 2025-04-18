from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from .models import User, Student, Lecturer, Administrator, Issue, Notification, Status, LoginHistory, UserRole, PasswordResetToken

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

# Update the UserRegistrationSerializer
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    college = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = [
            'username', 
            'email', 
            'password', 
            'confirm_password',
            'first_name',
            'last_name',
            'college'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate(self, attrs):
        # Validate passwords match
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Validate email is unique
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists"})
            
        # Validate username is unique
        #if User.objects.filter(username=attrs['username']).exists():
        #    raise serializers.ValidationError({"username": "Username already exists"})
            
        return attrs

    def create(self, validated_data):
        try:
            # Remove confirm_password from the data
            validated_data.pop('confirm_password')
            college = validated_data.pop('college')
            
            # Get or create student role
            student_role, _ = UserRole.objects.get_or_create(role_name='student')
            
            # Create user instance
            user = User.objects.create(
                username=validated_data['username'],
                email=validated_data['email'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                role=student_role
            )
            
            # Set password
            user.set_password(validated_data['password'])
            user.save()
            
            # Create student profile
            Student.objects.create(user=user, college=college)
            
            return user
            
        except Exception as e:
            raise serializers.ValidationError(f"Error creating user: {str(e)}")

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField(max_length=50)  # Changed from 'otp' to 'token' to match your views

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', 'name']
        
# Model Serializers
class UserSerializer(serializers.ModelSerializer):
    # Nested serializer to display role details; accepts role_name separately for input
    role = UserRoleSerializer(read_only=True)
    role_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'role_name', 'first_name', 'last_name']

    def create(self, validated_data):
        role_name = validated_data.pop('role_name')
        role = UserRole.objects.get(name=role_name)
        user = User.objects.create(**validated_data, role=role)
        return user

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Student
        fields = '__all__'
        depth = 1

class LecturerSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Lecturer
        fields = '__all__'
        depth = 1

class AdministratorSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Administrator
        fields = '__all__'
        depth = 1

    def create(self, validated_data):
        # Create a new student and hash the password
        student = Student.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        student.set_password(validated_data['password'])
        student.save()
        return student

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

class IssueSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    lecturer = LecturerSerializer(read_only=True)
    status = StatusSerializer(read_only=True)

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ['reported_date']

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
            # Create a new login history entry
            LoginHistory.objects.create(user=user)
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Error resetting password: {str(e)}")

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        """Ensure the passwords match"""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def validate_new_password(self, value):
        """Validate the new password meets Django's password strength requirements."""
        try:
            validate_password(value)  # Django's built-in password validation
        except ValidationError as exc:
            raise serializers.ValidationError(str(exc))  # Raise error if password is weak
        return value

    def save(self):
        """Update the user's password if the token is valid"""
        token = self.validated_data['token']
        new_password = self.validated_data['new_password']
        
        try:
            # Check if the token is valid (implement your logic for token validation)
            password_reset_token = PasswordResetToken.objects.get(token=token)
            user = password_reset_token.user  # Get the user associated with the token
            
            if password_reset_token.is_expired:
                raise serializers.ValidationError("This token has expired.")
            
            user.set_password(new_password)
            user.save()

            # Create a new login history entry after password reset
            LoginHistory.objects.create(user=user)
            return user  # Return the user with the updated password

        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired token.")
        except Exception as e:
            raise serializers.ValidationError(f"Error resetting password: {str(e)}")


class PasswordResetConfirmSerializer(serializers.Serializer):
    # Serializer for handling password reset confirmation input
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)


    def validate(self, data):
        """Ensure the passwords match"""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return value
