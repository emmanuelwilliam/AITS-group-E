from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginViewSet,
    StudentViewSet,
    AdministratorViewSet
)


router = DefaultRouter()
router.register(r'student',StudentViewSet)
router.register(r'administrator',AdministratorViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('login/', LoginViewSet.as_view({'post': 'create'}))
]



