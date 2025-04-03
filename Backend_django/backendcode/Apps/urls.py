from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginHistoryViewSet,
    StudentViewSet,
    AdministratorViewSet,
    LecturerViewSet,
    IssueViewSet,
    NotificationViewSet,
    StatusViewSet,
    UserRoleViewSet,
    UserRegistrationViewSet,
    filter_issues,
    user_login,
    user_logout,
)

# Create a router object
router = DefaultRouter()
router.register(r'student', StudentViewSet, basename='student')
router.register(r'administrator', AdministratorViewSet, basename='administrator')
router.register(r'lecturer', LecturerViewSet, basename='lecturer')
router.register(r'issue', IssueViewSet, basename='issue')
router.register(r'notification', NotificationViewSet, basename='notification')
router.register(r'status', StatusViewSet, basename='status')
router.register(r'login-history', LoginHistoryViewSet, basename='login-history')
router.register(r'user-role', UserRoleViewSet, basename='user-role')
router.register(r'auth/register', UserRegistrationViewSet, basename='register')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login/', user_login, name='login'),
    path('api/issues-filter/', filter_issues, name='filter-issues'),
    path('api/auth/logout/', user_logout, name='logout'),
]