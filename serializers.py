from rest_framework import serializers
from .models import CustomUser, Student, Lecturer, Administrator, Issue, Notification, Status, LoginHistory, UserRole

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'role']

class StudentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    class Meta:
        model = Student
        fields = '__all__'

class LecturerSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    class Meta:
        model = Lecturer
        fields = '__all__'

class AdministratorSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
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
    user = CustomUserSerializer(read_only=True)
    class Meta:
        model = LoginHistory
        fields = '__all__'

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'