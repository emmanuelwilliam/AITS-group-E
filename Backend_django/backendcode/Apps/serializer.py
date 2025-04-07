from rest_framework import serializers
from .models import User, Student, Lecturer, Administrator, Issue, Notification, Status, LoginHistory, UserRole

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
   
    class Meta:
        model = Issue
        fields = '__all__'
        
        def create(self, validated_data):
        # Example: Get lecturer from student's course
            student = validated_data.get('student')
            if student and student.course:
                validated_data['lecturer'] = student.course.lecturer
            return super().create(validated_data)

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
