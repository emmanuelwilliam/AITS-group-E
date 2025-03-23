from rest_framework.decorators import api_view 
from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from .models import User, Student, Lecturer, Administrator, Issue, Notification, Status, LoginHistory, UserRole
from .serializer import (
    UserSerializer, StudentSerializer, LecturerSerializer, AdministratorSerializer,
    IssueSerializer, NotificationSerializer, StatusSerializer, LoginHistorySerializer, UserRoleSerializer
)

# DRF Viewsets
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.all()
    serializer_class = LecturerSerializer

class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

class LoginHistoryViewSet(viewsets.ModelViewSet):
    queryset = LoginHistory.objects.all()
    serializer_class = LoginHistorySerializer

class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    
@api_view(['GET'])
def filter_issues(request):
    status = request.GET.get('status',None)
    issues_qs = Issue.objects.all()
    if status:
        issues_qs = issues_qs.filter(status=status)
    serializer = IssueSerializer(issues_qs, many=True)
    return Response(serializer.data)
