from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from .views import (
    ReactAppView,
    EmailOrUsernameTokenObtainPairView,
    LoginHistoryViewSet,
    StudentViewSet,
    AdministratorViewSet,
    LecturerViewSet,
    IssueViewSet,
    NotificationViewSet,
    StatusViewSet,
    UserRoleViewSet,
    register_student,
    register_Lecturer,
    register_administrator,
    get_user_role,
    get_notifications,
    filter_issues,
    create_issue,
    update_issue,
    delete_issue,
    login_view,
    verify_email,
    current_user,
)

# Create a router object and register viewsets only once
router = DefaultRouter()

router.register(r'login-history', LoginHistoryViewSet, basename='login-history')
router.register(r'students', StudentViewSet, basename='students')
router.register(r'administrators', AdministratorViewSet, basename='administrators')
router.register(r'Lecturers', LecturerViewSet, basename='Lecturers')
router.register(r'issues', IssueViewSet, basename='issues')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'status', StatusViewSet, basename='status')  # Only register once
router.register(r'user-roles', UserRoleViewSet, basename='user-roles')

# Define the URL patterns
urlpatterns = [
    # API endpoints for JWT authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('login/', EmailOrUsernameTokenObtainPairView.as_view(), name='api-login'),
     path('user/me/', current_user, name='current-user'),

    # Custom views for registration, issues, etc.
    path('register/student/', register_student, name='register_student'),
    path('register/Lecturer/', register_Lecturer, name='register_Lecturer'),
    path('register/administrator/', register_administrator, name='register_administrator'),
    path('verify-email/', verify_email, name='verify-email'),

    
    # Issue management
    path('issue/filter/', filter_issues, name='filter_issues'),
    path('issues/', create_issue, name='create_issue'),
    path('issue/update/<int:pk>/', update_issue, name='update_issue'),
    path('issue/delete/<int:pk>/', delete_issue, name='delete_issue'),
    
    # Other API endpoints
    #path('login-history/', get_login_history, name='get_login_history'),
    path('user-role/', get_user_role, name='get_user_role'),
    path('notifications/', get_notifications, name='get_notifications'),
    
    # Include router URLs
    path('', include(router.urls)),
]
