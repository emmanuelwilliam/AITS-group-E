from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from .models import CustomUser, Student, Lecturer, Administrator, Issue, Notification, Status, LoginHistory, UserRole
from .serializers import (
    CustomUserSerializer, StudentSerializer, LecturerSerializer, AdministratorSerializer,
    IssueSerializer, NotificationSerializer, StatusSerializer, LoginHistorySerializer, UserRoleSerializer
)

# Traditional Django Views
@login_required
def log_issue(request):
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description")
        lecturer_id = request.POST.get("lecturer_id")
        lecturer = get_object_or_404(Lecturer, id=lecturer_id)

        issue = Issue.objects.create(
            student=request.user.student_profile,
            lecturer=lecturer,
            title=title,
            description=description,
            category=request.POST.get("category"),
            priority=request.POST.get("priority"),
            status=Status.objects.get(status_name="Pending")
        )
        messages.success(request, "Issue submitted successfully!")
        return redirect("view_issues")

    lecturers = Lecturer.objects.all()
    return render(request, "submit_issue.html", {"lecturers": lecturers})

@login_required
def view_issues(request):
    issues = Issue.objects.filter(student=request.user.student_profile)
    return render(request, "view_issues.html", {"issues": issues})

@login_required
def check_issue_status(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id, student=request.user.student_profile)
    return JsonResponse({"status": issue.status.status_name})

@login_required
def msg_lecturer(request, lecturer_id):
    if request.method == "POST":
        content = request.POST.get("content")
        lecturer = get_object_or_404(Lecturer, id=lecturer_id)

        Notification.objects.create(
            issue=Issue.objects.filter(student=request.user.student_profile, lecturer=lecturer).first(),
            message=content,
            notification_type="Message"
        )
        messages.success(request, "Message sent successfully!")
    return render(request, "msg_lecturer.html", {"lecturer_id": lecturer_id})

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