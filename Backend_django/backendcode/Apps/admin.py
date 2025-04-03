from django.contrib import admin
from django.db import models
from django.db.models import Field
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
    """
    Base admin class with common configurations for all models.
    Provides consistent admin interface experience across all
    registered models
    """

    # Display configuration
    save_on_top = True#show save buttons at the top of the form
    actions_on_bottom = True#show actions at the bottom
    actions_on_top = False#dont duplicate actions at the top
    empty_value_display = '(None)'# how empty values are displayed
    list_per_page = 50#number of items per page
    ordering = ['-id']  # Sort by newest entries first
    
    #List View Features
    list_display = ['__str__','created_at']#Default columns to display
    list_filter = ['created_at'] #Default filters
    search_fields = ['id']#Default search fields
    actions_selection_counter = True #Show selected items counter    
    
    #Performance optimization
    show_full_result_count = False #Better performancde for large tables

    def get_queryset(self, request):
        """
        Optimize queryset by selecting related fields
        Override in child classes to add model-specific optimizations.
        """
        qs = super().get_queryset(request)
        return qs.select_related()
        
    def get_date_hierarchy(self):
        """
        Automatically detect and set date hierarchy based on model fields.
        Looks for 'created_at', 'uodated_at', or 'date' fields
        """
        date_fields = ['created_at','updated_at','date']
        for field_name in date_fields:
            if hasattr(self.model, field_name):
                field = self.model._meta.get_field(field_name)
                if isinstance(field,(models.DateTimeField, models.DateField)):
                    return field_name
        return None
    
    def view_on_site(self, obj):
        """
        Generate link to view the object on the live site.
        Requires get_absolute_url() to be defined on the model.
        """
        if hasattr(obj, 'get_absolute_url'):
            return obj.get_absolute_url
        return None
    
    def get_absolute_url(self):
        return reverse(f'{self._meta.model_name}-detail',kwargs={'pk': self.pk})

# Model-specific admin classes
class StudentAdmin(CommonAdmin):
    list_display = ('id','user','college','created_at')
    list_filter = ('user',)#optimize for user relationship
    search_fields = ('user__username', 'college')
    readonly_fields = ('created_at', 'updated_at')
    
    @admin.display(description='Details')
    def view_details(self, obj):
        url = reverse(f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change', args=[obj.id])
        return format_html('<a href="{}">View</a>', url)

    def get_absolute_url(self):
        return reverse(f'{self._meta.model_name}-detail',kwargs={'pk': self.pk})

class AdministratorAdmin(CommonAdmin):
    list_display = ('id', 'username', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email')

    def get_absolute_url(self):
        return reverse(f'{self._meta.model_name}-detail',kwargs={'pk': self.pk})

class CourseUnitAdmin(CommonAdmin):
    list_display = ('id', 'name', 'credits', 'status')
    list_filter = ('department', 'level')
    search_fields = ('name', 'description')

    def get_absolute_url(self):
        return reverse(f'{self._meta.model_name}-detail',kwargs={'pk': self.pk})

class IssueAdmin(CommonAdmin):
    list_display = ('id', 'title', 'status', 'student', 'created_at')
    list_filter = ('status', 'priority')
    list_select_related = ('student__user', 'status')
    raw_id_fields = ('student','lecturer')#Better for large tables
    autocomplete_fields = ['status']# Enables  search for status

    def get_absolute_url(self):
        return reverse(f'{self._meta.model_name}-detail',kwargs={'pk': self.pk})

class NotificationAdmin(CommonAdmin):
    list_display = ('id', 'issue','is_read','created_at')
    list_filter = ('is_read','notification_type')
    list_editable = ('is_read')#Allow quick editing

    def mark_as_read(self, request, queryset):
        """
        Custom admin action to mark notifications as read
        """
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} notifications marked as read")
    mark_as_read.short_description = "Mark selected as read"
    actions = [mark_as_read]

    def get_absolute_url(self):
        return reverse(f'{self._meta.model_name}-detail',kwargs={'pk': self.pk})

class StatusAdmin(CommonAdmin):
    list_display = ('id', 'name', 'description', 'active')
    list_filter = ('active',)
    search_fields = ('name', 'description')

    def get_absolute_url(self):
        return reverse(f'{self._meta.model_name}-detail',kwargs={'pk': self.pk})

class LoginHistoryAdmin(CommonAdmin):
    list_display = ('id', 'user', 'login_time', 'ip_address')
    list_filter = ('success', 'created_at')
    readonly_fields = ('created_at', 'ip_address')
    search_fields = ('user__username', 'ip_address')

    def get_absolute_url(self):
        return reverse(f'{self._meta.model_name}-detail',kwargs={'pk': self.pk})

#Unregister and re-registermodels with custom admin classes
admin.site.unregister(Student)
admin.site.unregister(Issue)
admin.site.unregister(Notification)
admin.site.register(Student,StudentAdmin)
admin.site.register(Issue, IssueAdmin)
admin.site.register(Notification, NotificationAdmin)