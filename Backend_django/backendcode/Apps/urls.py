from django.urls import path,include
from rest_framework.routers import DefaultRouter
from rest_framework import views, schemas, exceptions, renderers, serializers
from .views import StudentViewSet,AdministratorViewSet


router = DefaultRouter()
router.register(r'student',StudentViewSet)
router.register(r'administrator',AdministratorViewSet)

urlpatterns = [
    path('api/', include(router.urls))
]


