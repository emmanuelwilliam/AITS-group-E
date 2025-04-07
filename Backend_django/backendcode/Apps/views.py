from rest_framework.decorators import api_view 
from rest_framework import viewsets, mixins, status,filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User, Student, Lecturer, Administrator, Issue, Notification, Status, LoginHistory, UserRole
from .serializer import (
    UserSerializer, StudentSerializer, LecturerSerializer, AdministratorSerializer,
    IssueSerializer, NotificationSerializer, StatusSerializer, LoginHistorySerializer, UserRoleSerializer
)
from .filters import IssueFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import exception_handler
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

# DRF Viewsets
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.select_related('student','lecturer').all()
    serializer_class = LecturerSerializer

class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'lecturer']
    search_fields = ['title', 'description']
    ordering_fields = ['reported_date', 'priority']
    
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

@api_view(['GET'])
def get_notifications(request):
    user = request.user
    if user.is_authenticated:
        notifications = Notification.objects.filter(user=user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    return Response({"error":"Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def register_student(request):
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def register_lecturer(request):
    serializer = LecturerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response (serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def register_administrator(request):
    serializer = AdministratorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response (serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_login_history(request):
    user = request.user
    if user.is_authenticated:
        login_history = LoginHistory.objects.filter(user=user)
        serializer = LoginHistorySerializer(login_history, many=True)
        return Response(serializer.data)
    return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_user_role(request):
    user = request.user
    if user.is_authenticated:
        try:
            user_role = UserRole.objects.get(user=user)
            serializer = UserRoleSerializer(user_role)
            return Response(serializer.data)
        except UserRole.DoesNotExist:
            return Response({"error":"User role no found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error":"Unauthorized"},status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['POST'])
def reset_password(request):
    username = request.data.get('username')
    new_password = request.data.get('new_password')
    try:
        user = User.objects.get(username=username)
        user.password = make_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)   
#For the forms
from django.shortcuts import render, redirect, get_object_or_404
from .models import Issue, Student, Lecturer, CourseUnit, Administrator, Notification, Status
from .forms import(
    StudentForm, LecturerForm, AdministratorForm, IssueForm,
    NotificationForm, StatusForm, CourseUnitForm
)

#view for listing all issues
def issue_list(request):
    issues = Issue.objects.all()
    return render(request, 'issues/issue_list.html', {'issues':issues})

def create_issue(request):
    if request.method == "POST":
        form = IssueForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('issue_list')
    else:
        form = IssueForm()
    return render(request, 'issues/issue_form.html',{'form': form})
    
#View for updating an existing issue
def update_issue(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id)
    if request.method == "POST":
        form = IssueForm(request.POST, instance=issue)
        if form.is_valid():
            form.save()
            return redirect('issue_list')
    else:
        form = IssueForm(instance=issue)
        return render(request, 'issues/issue_form.html', {'form': form})

#View for deleting an issue
def delete_issue(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id)
    if request.method == "POST":
        issue.delete()
        return redirect('issue_list')
    return render(request, 'issues/issue_confirm_delete.html', {'issue': issue})

#View for listing all students
def student_list(request):
    students = Student.objects.all()
    return render(request, 'students/student_list.html',{'students': students})

#View for updating student details
def update_student(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    if request.method == "POST":
        form = StudentForm(request.POST, instance=student)
        if form.is_valid():
            form.save()
            return redirect('student_list')
    else:
        form = StudentForm(instance=student)
    return render(request, 'students/student_form.html', {'form': form})

#view for API error handling
def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        response.data['status_code'] = response.status_code
    return response
