from rest_framework.decorators import api_view ,permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, mixins, status,filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User, Student, Lecturer, Administrator, Issue, Notification, Status, LoginHistory, UserRole
from .serializer import (
    UserRegistrationSerializer, StudentSerializer, LecturerSerializer, AdministratorSerializer,
    IssueSerializer, NotificationSerializer, StatusSerializer, LoginHistorySerializer, UserRoleSerializer
)
from .filters import IssueFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import exception_handler
from .models import User
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView
from django.conf import settings
import os
from django.http import Http404
from django.core.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

# DRF Viewsets
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.select_related('student','lecturer').all()
    serializer_class = LecturerSerializer

class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.select_related('lecturer').prefetch_related('notifications').all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'lecturer']
    search_fields = ['title', 'description']
    ordering_fields = ['reported_date', 'priority']
    
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

class LoginHistoryViewSet(viewsets.ModelViewSet):
    queryset = LoginHistory.objects.all()
    serializer_class = LoginHistorySerializer

class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    
@api_view(['GET'])
def filter_issues(request):
    try:
        status_param = request.GET.get('status', None)
        issues_qs = Issue.objects.all()
        if status_param:
            issues_qs = issues_qs.filter(status=status_param)
        serializer = IssueSerializer(issues_qs, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_notifications(request):
    try:
        user = request.user
        if user.is_authenticated:
            notifications = Notification.objects.filter(user=user)
            serializer = NotificationSerializer(notifications, many=True)
            return Response(serializer.data)
        return Response({"error":"Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def register_student(request):
    if request.method == 'POST':
        data = request.data
        try:
            # Validate required fields
            required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
            for field in required_fields:
                if not data.get(field):
                    return Response({
                        'error': f'Missing required field: {field}',
                        'required_fields': required_fields
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Check if username or email already exists
            if User.objects.filter(username=data['username']).exists():
                return Response({
                    'error': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=data['email']).exists():
                return Response({
                    'error': 'Email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get the student role
            student_role = UserRole.objects.get(name='student')
            
            # Create user with role object
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=student_role
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Student registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': 'student'
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
            
        except UserRole.DoesNotExist:
            return Response({
                'error': 'Student role not found in the system'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Registration error: {str(e)}")  # For server logs
            return Response({
                'error': 'Registration failed',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def register_lecturer(request):
    if request.method == 'POST':
        data = request.data
        try:
            # Get lecturer role
            lecturer_role = UserRole.objects.get(name='lecturer')
            
            # Create user
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=lecturer_role
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Lecturer registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': 'lecturer'
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e),
                'detail': 'Registration failed'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    return Response({
        'message': 'Use POST method to register'
    }, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST'])
def register_administrator(request):
    try:
        serializer = AdministratorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_login_history(request):
    try:
        user = request.user
        if user.is_authenticated:
            login_history = LoginHistory.objects.filter(user=user)
            serializer = LoginHistorySerializer(login_history, many=True)
            return Response(serializer.data)
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_role(request):
    user = request.user
    if user.is_authenticated:
        try:
            user_role = UserRole.objects.get(user=user)
            serializer = UserRoleSerializer(user_role)
            return Response(serializer.data)
        except UserRole.DoesNotExist:
            return Response({"error":"User role no found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"error":"Unauthorized"},status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['POST'])
def reset_password(request):
    username = request.data.get('username')
    new_password = request.data.get('new_password')
    try:
        user = User.objects.get(username=username)
        user.password = make_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)   

@api_view(['GET'])
def issue_list(request):
    issues = Issue.objects.all()
    serializer = IssueSerializer(issues, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_issue(request):
    serializer = IssueSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
  
#View for updating an existing issue
@api_view(['PUT'])
def update_issue(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id)
    serializer = IssueSerializer(issue, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)       

#View for deleting an issue
@api_view(['DELETE'])
def delete_issue(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id)
    issue.delete()
    return Response({"message":"Issue deleted successfully"}, status=204)

#View for listing all students
@api_view(['GET'])
def student_list(request):
    students = Student.objects.all()
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)

#View for updating student details
@api_view(['PUT'])
def update_student(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    serializer = StudentSerializer(student, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

#view for API error handling
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Please provide both username and password'},
                      status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, 
                      status=status.HTTP_401_UNAUTHORIZED)
    
    if user.check_password(password):
        # Create login history entry
        LoginHistory.objects.create(user=user)
        
        # Return success response
        return Response({
            'message': 'Login successful',
            'user_id': user.id,
            'username': user.username
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, 
                      status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def serve_home_page(request):
    try:
        # Return a response redirecting/routing to the React Home page
        return Response({
            'redirect': '/',
            'status': 'success'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    
from django.views.generic import TemplateView
from django.shortcuts import render

class ReactAppView(TemplateView):
    template_name = 'index.html'


def custom_exception_handler(exc, context):
    """Handle exceptions and provide better error messages"""
    response = exception_handler(exc, context)
    
    if response is None:
        if isinstance(exc, Http404):
            response = Response(
                {'error': 'Not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        elif isinstance(exc, PermissionDenied):
            response = Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        else:
            response = Response(
                {'error': str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return response


class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Get the main.js file from dist directory
        dist_dir = settings.FRONTEND_DIR / 'dist' / 'assets' / 'js'
        if dist_dir.exists():
            js_files = [f for f in os.listdir(dist_dir) if f.startswith('main.') and f.endswith('.js')]
            if js_files:
                context['main_js'] = f'assets/js/{js_files[0]}'
        return context