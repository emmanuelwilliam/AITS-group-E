from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.views.generic import TemplateView
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
    get_login_history,
    get_user_role,
    get_notifications,
    filter_issues,
    create_issue,
    update_issue,
    delete_issue,
)

# Create a router object
router = DefaultRouter()

# Register ViewSets
router.register(r'student', StudentViewSet)
router.register(r'administrator', AdministratorViewSet)
router.register(r'lecturer', LecturerViewSet)
router.register(r'issue', IssueViewSet)
router.register(r'notification', NotificationViewSet)
router.register(r'status', StatusViewSet)
router.register(r'loginHistory', LoginHistoryViewSet)
router.register(r'userrole', UserRoleViewSet)

# API URLs
urlpatterns = [
    # Authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Registration endpoints
    path('register/student/', register_student, name='register_student'),
    path('register/lecturer/', register_lecturer, name='register_lecturer'),
    path('register/administrator/', register_administrator, name='register_administrator'),
    
    #Issue management
    path('issue/filter/', filter_issues, name='filter_issues'),
    path('issue/create/', create_issue, name='create_issue'),
    path('issue/update/<int:pk>/', update_issue, name='update_issue'),
    path('issue/delete/<int:pk>/', delete_issue, name='delete_issue'),
    
    # Other API endpoints
    path('login-history/', get_login_history, name='get_login_history'),
    path('user-role/', get_user_role, name='get_user_role'),
    path('notifications/', get_notifications, name='get_notifications'),
    
    # Include router URLs
    path('', include(router.urls)),
]