from django.shortcuts import render, get_object_or_404,redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Issue, Message, CustomUser

# Student Views
@login_required
def log_issue(complaint):
    if complaint.method == "POST":
        title = complaint.POST.get("title")
        description = complaint.POST.get("description")
        lecturer_id = complaint.POST.get("lecturer_id")
        lecturer = get_object_or_404 (CustomUser, id =lecturer_id, role="lecturer")

        issue = Issue.objects.create(
            student = complaint.user,
            lecturer = lecturer, 
            title = title,
            description=description,
            status = "Pending"
        )
        messages.success(complaint, "Issue submitted successfully!")
        return redirect ("view_issues")
    
    lecturers= CustomUser.objects.filter(role="lecturer")
    return render(complaint, "submit_issue.html",{"lecturers": lecturers})

@login_required
def view_issues(complaint):
    issues= Issue.objects.filter(student=complaint.user)
    return render (complaint, "view_ssues.html",{"issues": issues})

@login_required
def check_issue_status(complaint, issue_id):
    issue = get_object_or_404(Issue, id=issue_id, student=complaint.user)
    return JsonResponse({"status":issue.status})

@login_required
def msg_lecturer(complaint, lecturer_id):
    if complaint.method == "POST":
        content = complaint.POST.get("content")
        lecturer = get_object_or_404(CustomUser, id=lecturer_id, role="lecturer")

        Message.objects.create(
            sender=complaint.user,
            receiver=lecturer,
            content=content
        )
        messages.success(complaint, "Message sent successfully!")

    return render(complaint, "msg_lecturer.html",{"lecturer_id":lecturer_id})

#Lecturer Views
@login_required
def view_assigned_issues(complaint):
    issues = Issue.objects.filter(lecturer=complaint.user)
    return render(complaint, "lecturer_issues.html", {"issues": issues})

@login_required
def update_issue_status(complaint, issue_id):
    issue = get_object_or_404(Issue, id=issue_id, lecturer=complaint.user)

    if complaint.method =="POST":
        new_status =complaint.POST.get("status")
        issue.status = new_status
        issue.save()
        messages.success(complaint, "Issue status updated!")

    return redirect ("view_assigned_issues")

@login_required
def receive_messages(complaint):
    messages_received = Message.objects.filter(receiver=complaint.user)
    return render(complaint, "lecturer_messages.html", {"messages":messages_received})

#Admin Views
@login_required
def admin_dashboard(complaint):
    total_issues = Issue.objects.count()
    total_students = CustomUser.objects.filter(role="student").count()
    lecturers = CustomUser.objects.filter(role="lecturer")

    lecturer_progress={
        lecturer.username: Issue.objects.filter(lecturer=lecturer).count()
        for lecturer in lecturers
    }
    return render (complaint, "admin_dashboard.html",{
        "total_issues": total_issues,
        "total_students": total_students,
        "lecturer_progress": lecturer_progress
    })