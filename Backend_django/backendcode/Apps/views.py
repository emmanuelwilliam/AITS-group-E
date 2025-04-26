from rest_framework.decorators import api_view ,permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, mixins, status,filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User, Student, Lecturer, Administrator, Issue, Notification, Status, LoginHistory, UserRole, EmailVerification
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
from django.utils import timezone
from django.core.mail import send_mail
from datetime import timedelta


# DRF Viewsets
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.select_related('student','Lecturer').all()
    serializer_class = LecturerSerializer

# ViewSet that provides full API access to Administrator objects
class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.all()
    serializer_class = AdministratorSerializer

# ViewSet for managing Issue objects with authentication, filtering, search, and ordering support
class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.select_related('Lecturer').prefetch_related('notifications').all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'Lecturer']
    search_fields = ['title', 'description']
    ordering_fields = ['reported_date', 'priority']
    filterset_class = IssueFilter 

# ViewSet that provides full API access to Notification objects
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


# ViewSet that provides full API access to Status objects
class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

# ViewSet that provides full API access to LoginHistory objects
class LoginHistoryViewSet(viewsets.ModelViewSet):
    queryset = LoginHistory.objects.all()
    serializer_class = LoginHistorySerializer

# ViewSet that provides full API access to UserRole objects
class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_role(request):
    user = request.user
    return Response({'role': user.role.name if hasattr(user, 'role') else 'unknown'})

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def register_student(request):
    if request.method == 'POST':
        try:
            print("Received registration data:", request.data)
            
            data = request.data
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

            try:
                # Get the student role
                student_role = UserRole.objects.get(name='student')
            except UserRole.DoesNotExist:
                # Create the student role if it doesn't exist
                student_role = UserRole.objects.create(name='student')
                print("Created new student role")
            
            # Create user with role object but set is_active=False
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                is_active=False  # User starts inactive until email is verified
            )
            # Set the role after user creation
            user.role = student_role
            user.save()
            
            print(f"Created user: {user.username} with role: {user.role}")
            
            # Generate okens even for inactive users
            refresh = RefreshToken.for_user(user)

            # Create verification record
            verification = EmailVerification.objects.create(
                user=user,
                expires_at=timezone.now() + timedelta(minutes=30)
            )
            verification_code = verification.generate_code()
            verification.save()

            # Send verification email
            try:
                send_mail(
                    'Verify your email - Student Registration',
                    f'Your verification code is: {verification_code}\nThis code will expire in 30 minutes.',
                    'from@yourdomain.com',  # Update this in settings.py
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Failed to send email: {str(e)}")
                user.delete()  # Rollback user creation if email fails
                return Response({
                    'error': 'Failed to send verification email'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': True,
                'message': 'Registration successful. Please check your email for verification code.',
                'user': {
                    'email': user.email,
                    'username': user.username,
                },    
                'tokens':{ #Include these for immediate login after verification
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print("Registration error:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response({
                'error': str(e),
                'detail': 'Registration failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'message': 'Use POST method to register'
    }, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def register_Lecturer(request):
    if request.method == 'POST':
        try:
            data = request.data
            required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
            for field in required_fields:
                if not data.get(field):
                    return Response({
                        'error': f'Missing required field: {field}',
                        'required_fields': required_fields
                    }, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(username=data['username']).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=data['email']).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

            # Get or create the Lecturer role
            Lecturer_role, created = UserRole.objects.get_or_create(role_name='Lecturer')
            if created:
                print("Created new Lecturer role")

            # Create user with is_active=False
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                is_active=False
            )
            user.role = Lecturer_role
            user.save()

            print(f"Created user: {user.username} with role: {user.role}")

            # Generate verification code
            verification = EmailVerification.objects.create(
                user=user,
                expires_at=timezone.now() + timedelta(minutes=30)
            )
            verification_code = verification.generate_code()
            verification.save()

            # Send verification email
            try:
                send_mail(
                    'Verify your email - Lecturer Registration',
                    f'Your verification code is: {verification_code}\nThis code will expire in 30 minutes.',
                    'from@yourdomain.com',
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Failed to send email: {str(e)}")
                user.delete()
                return Response({'error': 'Failed to send verification email'}, status=500)

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'success': True,
                'message': 'Lecturer registered successfully. Please check your email for verification code.',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': 'Lecturer'
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=201)

        except Exception as e:
            import traceback
            print("Registration error:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response({'error': str(e), 'detail': 'Registration failed'}, status=400)

    return Response({'message': 'Use POST method to register'}, status=405)
      

@api_view(['POST'])
@permission_classes([AllowAny])
def register_administrator(request):
    try:
        data = request.data
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return Response({
                    'error': f'Missing required field: {field}',
                    'required_fields': required_fields
                }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=data['username']).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=data['email']).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create the administrator role
        admin_role, created = UserRole.objects.get_or_create(role_name='administrator')
        if created:
            print("Created new administrator role")

        # Create inactive admin user
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            is_active=False
        )
        user.role = admin_role
        user.save()

        verification = EmailVerification.objects.create(
            user=user,
            expires_at=timezone.now() + timedelta(minutes=30)
        )
        code = verification.generate_code()
        verification.save()

        # Send email
        send_mail(
            'Verify your email - Admin Registration',
            f'Your verification code is: {code}\nThis code will expire in 30 minutes.',
            'from@yourdomain.com',
            [user.email],
            fail_silently=False,
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'success': True,
            'message': 'Administrator registered successfully. Please check your email for verification code.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': 'administrator'
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        import traceback
        print("Admin registration error:", str(e))
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({
            'error': 'Please provide both username and password'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)

        if not user.is_active:
            return Response({
                'error': 'Account is not active. Please verify your email.'
            }, status=status.HTTP_403_FORBIDDEN)

        if user.check_password(password):
            # Extract IP address with fallback
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR') or '127.0.0.1'

            # ✅ Add session_time
            LoginHistory.objects.create(
                user=user,
                ip_address=ip,
                session_time=timezone.now()
            )

            refresh = RefreshToken.for_user(user)

            return Response({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role.name if user.role else None
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

    except User.DoesNotExist:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        import traceback
        print("LOGIN ERROR:", str(e))
        print(traceback.format_exc())
        return Response({'error': 'Internal server error'}, status=500)


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

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    try:
        email = request.data.get('email').lower()
        code = request.data.get('code')

        user = User.objects.get(email=email)
        verification = EmailVerification.objects.get(user=user)

        if verification.is_verified:
            return Response({
                'error': 'Email already verified'
            }, status=status.HTTP_400_BAD_REQUEST)

        if verification.code != code:
            return Response({
                'error': 'Invalid verification code'
            }, status=status.HTTP_400_BAD_REQUEST)

        if verification.expires_at < timezone.now():
            return Response({
                'error': 'Verification code expired'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify the user
        verification.is_verified = True
        verification.save()
        user.is_active = True
        user.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'success': True,
            'message': 'Email verified successfully',
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })

    except (User.DoesNotExist, EmailVerification.DoesNotExist):
        return Response({
            'error': 'Invalid verification attempt'
        }, status=status.HTTP_400_BAD_REQUEST)
