from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    Student, 
    Administrator,
    CourseUnit,
    Issue,
    Notification,
    Status,
    LoginHistory,
)

# Base admin class with common configurations
@admin.register(Student, Administrator, CourseUnit, Issue, Notification, Status, LoginHistory)
class CommonAdmin(admin.ModelAdmin):
    # Common attributes
    save_on_top = True
    actions_on_bottom = True
    actions_on_top = False
    
    # List view improvements
    list_per_page = 50
    ordering = ['-id']  # Sort by newest entries first
    
    # Search functionality
    search_fields = ['id']
    
    # Date hierarchy
    date_hierarchy = 'created_at'  # Assuming you have a created_at field
    
    # Actions dropdown
    actions_selection_counter = True
    
    # Empty value display
    empty_value_display = '(None)'
    
    def get_queryset(self, request):
        """Optimize queryset by selecting related fields"""
        qs = super().get_queryset(request)
        return qs.select_related()

# Model-specific admin classes
class StudentAdmin(CommonAdmin):
    list_display = ('id', 'full_name', 'email', 'status', 'view_details')
    list_filter = ('status', 'created_at')
    search_fields = ('first_name', 'last_name', 'email')
    readonly_fields = ('created_at', 'updated_at')
    
    @admin.display(description='Details')
    def view_details(self, obj):
        url = reverse(f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change', args=[obj.id])
        return format_html('<a href="{}">View</a>', url)

class AdministratorAdmin(CommonAdmin):
    list_display = ('id', 'username', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email')

class CourseUnitAdmin(CommonAdmin):
    list_display = ('id', 'name', 'credits', 'status')
    list_filter = ('department', 'level')
    search_fields = ('name', 'description')

class IssueAdmin(CommonAdmin):
    list_display = ('id', 'subject', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority', 'category')
    search_fields = ('subject', 'description')
    readonly_fields = ('reported_by', 'created_at')

class NotificationAdmin(CommonAdmin):
    list_display = ('id', 'title', 'recipient_type', 'sent_at')
    list_filter = ('recipient_type', 'status')
    search_fields = ('title', 'message')

class StatusAdmin(CommonAdmin):
    list_display = ('id', 'name', 'description', 'active')
    list_filter = ('active',)
    search_fields = ('name', 'description')

class LoginHistoryAdmin(CommonAdmin):
    list_display = ('id', 'user', 'login_time', 'ip_address')
    list_filter = ('success', 'created_at')
    readonly_fields = ('created_at', 'ip_address')
    search_fields = ('user__username', 'ip_address')