from django.urls import path,include
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
    #get_issue_by_id,
    #get_all_issues,
    )
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.views.generic import RedirectView
#DefaultRouter is a feacture in Django REST Framework that automatically generates URL patterns for your API ViewSets
#Create a router object
router = DefaultRouter()
# register all viewsets with the router
router.register(r'student',StudentViewSet)
router.register(r'administrator',AdministratorViewSet)
router.register(r'lecturer',LecturerViewSet)
router.register(r'issue',IssueViewSet)
router.register(r'notification',NotificationViewSet)
router.register(r'status',StatusViewSet)
router.register(r'loginHistory',LoginHistoryViewSet)
router.register(r'userrole',UserRoleViewSet)

urlpatterns = [
    path('', RedirectView.as_view(url='/api/')),
    path('api/login/',TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/',TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/student/',register_student, name='register_student'),
    path('api/register/lecturer/',register_lecturer, name='register_lecturer'),
    path('api/register/administrator/', register_administrator, name='register_administrator'),
    path('api/login-history/', get_login_history, name='get_login_history'),
    path('api/user-role/', get_user_role, name='get_user_role'),
    path('api/notifications/', get_notifications, name='get_notifications'),
    path('api/issue/filter/', filter_issues, name='filter_issues'),
    path('api/issue/create/', create_issue, name='create_issue'),
    path('api/issue/update/<int:pk>/', update_issue, name='update_issue'),
    path('api/issue/delete/<int:pk>/', delete_issue, name='delete_issue'),
   # path('api/issue/<int:pk>/',get_issue_by_id, name='get_issue_by_id'),
   # path('api/issue/',get_all_issues, name='get_all_issues'),
    path('api/', include(router.urls)),
    path('login/', LoginHistoryViewSet.as_view({'post': 'create'}))
]




