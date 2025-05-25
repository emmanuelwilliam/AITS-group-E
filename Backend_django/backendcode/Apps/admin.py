from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User,
    Student,
    Lecturer,
    Administrator,
    CourseUnit,
    Issue,
    Notification,
    Status,
    LoginHistory,
    UserRole
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email')
    ordering = ('username',)

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'student_number', 'college', 'course')
    search_fields = ('user__username', 'student_number', 'registration_number')

@admin.register(Lecturer)
class LecturerAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'department', 'college')
    search_fields = ('user__username', 'employee_id', 'department')

@admin.register(Administrator)
class AdministratorAdmin(admin.ModelAdmin):
    list_display = ('user', 'contact_number')
    search_fields = ('user__username', 'contact_number')

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'student', 'status', 'reported_date', 'priority')
    list_filter = ('status', 'priority', 'category')
    search_fields = ('title', 'description', 'student__username')

@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ('status_name', 'last_update')
    search_fields = ('status_name',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('issue', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('message', 'issue__title')

@admin.register(CourseUnit)
class CourseUnitAdmin(admin.ModelAdmin):
    list_display = ('course_code', 'course_name')
    search_fields = ('course_code', 'course_name')

@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'ip_address', 'login_time', 'session_time')
    list_filter = ('login_time',)
    search_fields = ('user__username', 'ip_address')

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'role_name', 'created_at', 'is_verified')
    list_filter = ('role_name', 'is_verified')
    search_fields = ('name', 'role_name')
