from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from .views import (
    ReactAppView,
    LoginHistoryViewSet,
    StudentViewSet,
    AdministratorViewSet,
    LecturerViewSet,
    IssueViewSet,
    NotificationViewSet,
    StatusViewSet,
    UserRoleViewSet,
    register_student,
    register_lecturer,
    register_administrator,
    get_user_role,
    get_notifications,
    filter_issues,
    create_issue,
    update_issue,
    delete_issue,
    login_view,
)

# Create a router object and register viewsets only once
router = DefaultRouter()

router.register(r'login-history', LoginHistoryViewSet, basename='login-history')
router.register(r'students', StudentViewSet, basename='students')
router.register(r'administrators', AdministratorViewSet, basename='administrators')
router.register(r'lecturers', LecturerViewSet, basename='lecturers')
router.register(r'issues', IssueViewSet, basename='issues')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'status', StatusViewSet, basename='status')  # Only register once
router.register(r'user-roles', UserRoleViewSet, basename='user-roles')

# Define the URL patterns
urlpatterns = [
    # API endpoints for JWT authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Custom views for registration, issues, etc.
    path('register/student/', register_student, name='register_student'),
    path('register/lecturer/', register_lecturer, name='register_lecturer'),
    path('register/administrator/', register_administrator, name='register_administrator'),
    path('get_user_role/', get_user_role, name='get_user_role'),
    path('get_notifications/', get_notifications, name='get_notifications'),
    path('filter_issues/', filter_issues, name='filter_issues'),
    path('create_issue/', create_issue, name='create_issue'),
    path('update_issue/', update_issue, name='update_issue'),
    path('delete_issue/', delete_issue, name='delete_issue'),
    path('login/', login_view, name='login_view'),

    # Include the router's URLs for the viewsets
    path('api/', include(router.urls)),

    # React App route (this should be the last route)
    path('', ReactAppView.as_view(), name='react_app'),  # If you are using a React view
]
