from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from .views import *
from django.views.decorators.csrf import csrf_exempt


# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='students')
router.register(r'administrators', AdministratorViewSet, basename='administrators')
router.register(r'lecturers', LecturerViewSet, basename='lecturers')
router.register(r'issues', IssueViewSet, basename='issues')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'statuses', StatusViewSet, basename='status')
router.register(r'login-history', LoginHistoryViewSet, basename='login-history')
router.register(r'user-roles', UserRoleViewSet, basename='user-roles')

# Define URL patterns
urlpatterns = [
    # API endpoints for JWT authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('login/', EmailOrUsernameTokenObtainPairView.as_view(), name='api-login'),
    
    # User management
    path('user/me/', current_user, name='current-user'),
    path('user-role/', get_user_role, name='get_user_role'),

    # Registration endpoints
    path('register/student/', csrf_exempt(register_student), name='register_student'),
    path('register/lecturer/', csrf_exempt(register_Lecturer), name='register-lecturer'),
    path('register/administrator/', csrf_exempt(register_administrator), name='register-administrator'),
    path('verify-email/', verify_email, name='verify-email'),

    # Issue management
    path('issue/filter/', filter_issues, name='filter_issues'),
    path('issues/', issue_list, name='issue-list'),
    path('issues/create/', create_issue, name='create_issue'),
    path('issue/update/<int:pk>/', update_issue, name='update_issue'),
    path('issue/delete/<int:pk>/', delete_issue, name='delete_issue'),
    path('assign-issue/', assign_issue_to_lecturer, name='assign_issue_to_lecturer'),
    path('update-issue-status/', update_issue_status, name='update_issue_status'),
    path('student/issues/', student_issues, name='student_issues'),
    path('admin/statistics/', admin_statistics, name='admin_statistics'),
    
    # Notifications
    path('notifications/', get_notifications, name='get_notifications'),
    
    # Include router URLs last to avoid conflicts
    path('', include(router.urls)),
]