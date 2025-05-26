from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.db import transaction, IntegrityError, models
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.views.generic import TemplateView
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.core.exceptions import PermissionDenied
from rest_framework.views import exception_handler
from django.contrib.auth.hashers import make_password
import logging
import os
import traceback

from .models import (
    User, Student, Lecturer, Administrator, Issue, 
    Notification, Status, LoginHistory, UserRole, 
    EmailVerification
)
from .serializer import (
    UserRegistrationSerializer, StudentSerializer, 
    LecturerSerializer, AdministratorSerializer,
    IssueSerializer, NotificationSerializer, 
    StatusSerializer, LoginHistorySerializer, 
    UserRoleSerializer, UserSerializer
)
from .filters import IssueFilter

# Configure logger
logger = logging.getLogger(__name__)

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
    queryset = Issue.objects.select_related('student', 'assigned_to', 'status').prefetch_related('notifications').all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['reported_date', 'priority']
    filterset_class = IssueFilter 

    def get_permissions(self):
         # Allow anyone to create issues; require auth for all other actions
         if self.action == 'create':
             return [AllowAny()]
         return super().get_permissions()     

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

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def register_student(request):
    if request.method == 'GET':
        return Response({
            'message': 'Please submit registration data using POST method',
            'required_fields': {
                'user': {
                    'username': 'string',
                    'email': 'string',
                    'password': 'string',
                    'first_name': 'string',
                    'last_name': 'string',
                    'role_name': 'string'
                },
                'college': 'string',
                'course': 'string',
                'student_number': 'string',
                'registration_number': 'string'
            }
        }, status=status.HTTP_200_OK)

    logger.info("Incoming student registration data: %s", request.data)
    
    try:
        with transaction.atomic():
            # Create or get student role
            student_role, _ = UserRole.objects.get_or_create(role_name='student')
            
            # Add role to validated data
            data = request.data.copy()
            if 'user' not in data:
                data['user'] = {}
            data['user']['role'] = student_role.id
            
            serializer = StudentSerializer(data=data)
            
            if not serializer.is_valid():
                logger.warning('Validation errors: %s', serializer.errors)
                return Response(
                    {'error': 'Validation failed', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for existing student numbers and registration numbers
            student_number = serializer.validated_data.get('student_number')
            registration_number = serializer.validated_data.get('registration_number')
            
            if Student.objects.filter(student_number=student_number).exists():
                return Response(
                    {'error': 'Student number already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if Student.objects.filter(registration_number=registration_number).exists():
                return Response(
                    {'error': 'Registration number already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the student
            try:
                student = serializer.save()
                logger.info('Created student: %s', student)
                
                # Create email verification
                verification = EmailVerification.objects.create(
                    user=student.user,
                    expires_at=timezone.now() + timedelta(minutes=30)
                )
                verification_code = verification.generate_code()
                verification.save()
                
                logger.info('Generated verification code for %s', student.user.email)
                
                # Send verification email
                try:
                    send_mail(
                        'Verify your email - Student Registration',
                        f'''Welcome to the Academic Issue Tracking System!\n\nYour verification code is: {verification_code}\n\nThis code will expire in 30 minutes.''',
                        settings.EMAIL_HOST_USER,
                        [student.user.email],
                        fail_silently=False,
                    )
                    
                    # Generate tokens
                    refresh = RefreshToken.for_user(student.user)
                    
                    return Response({
                        'success': True,
                        'message': 'Student registered successfully! Check your email for verification.',
                        'tokens': {
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                        }
                    }, status=status.HTTP_201_CREATED)
                    
                except Exception as e:
                    logger.error('Failed to send verification email: %s', str(e))
                    raise Exception('Failed to send verification email')
                
            except IntegrityError as e:
                logger.error('Database integrity error: %s', str(e))
                return Response(
                    {'error': 'Database error. This student number or email may already exist.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
    except Exception as e:
        logger.error('Unexpected registration error: %s', str(e))
        logger.error(traceback.format_exc())
        return Response(
            {'error': 'Registration failed. Please try again later.', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def register_Lecturer(request):
    if request.method == 'GET':
        return Response({
            'message': 'Please submit registration data using POST method',
            'required_fields': {
                'user': {
                    'username': 'string',
                    'email': 'string (@mak.ac.ug email)',
                    'password': 'string (min 8 characters)',
                    'first_name': 'string',
                    'last_name': 'string',
                    'role_name': 'string'
                },
                'employee_id': 'string',
                'department': 'string',
                'college': 'string',
                'contact_number': 'string (10 digits, starts with 07)',
                'position': 'string'
            }
        }, status=status.HTTP_200_OK)

    logger.info("Incoming lecturer registration data: %s", request.data)

    try:
        with transaction.atomic():
            # Ensure the lecturer role exists and inject its PK
            lecturer_role, _ = UserRole.objects.get_or_create(role_name='lecturer')
            data = request.data.copy()
            if 'user' not in data:
                data['user'] = {}
            data['user']['role'] = lecturer_role.id

            # Validate email domain
            email = data['user'].get('email', '')
            if not email.endswith('@mak.ac.ug'):
                return Response(
                    {'error': 'Invalid email domain. Please use your Makerere University email (@mak.ac.ug).'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate contact number
            contact_number = data.get('contact_number', '')
            if not (contact_number.startswith('07') and contact_number.isdigit() and len(contact_number) == 10):
                return Response(
                    {'error': 'Invalid contact number. Please provide a 10-digit phone number starting with 07.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate password length
            password = data['user'].get('password', '')
            if len(password) < 8:
                return Response(
                    {'error': 'Password must be at least 8 characters long.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = LecturerSerializer(data=data)
            if not serializer.is_valid():
                logger.warning("Validation errors: %s", serializer.errors)
                return Response(
                    {"error": "Validation failed", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Prevent duplicates
            employee_id = serializer.validated_data['employee_id']
            if Lecturer.objects.filter(employee_id=employee_id).exists():
                return Response({"error": "Employee ID already exists."}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=email).exists():
                return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

            # Save lecturer
            lecturer = serializer.save()
            logger.info("Created lecturer: %s", lecturer)

            # Email verification
            verification = EmailVerification.objects.create(
                user=lecturer.user,
                expires_at=timezone.now() + timedelta(minutes=30)
            )
            code = verification.generate_code()
            verification.save()

            # Send email
            send_mail(
                'Verify your email - Lecturer Registration',
                f"Your verification code is: {code}\nIt expires in 30 minutes.",
                settings.EMAIL_HOST_USER,
                [lecturer.user.email],
                fail_silently=False
            )

            # Issue tokens
            refresh = RefreshToken.for_user(lecturer.user)
            return Response({
                'success': True,
                'message': 'Lecturer registered successfully! Check your email for verification.',
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

    except IntegrityError as e:
        logger.error('Database integrity error: %s', str(e))
        return Response(
            {"error": "Database error. This employee ID or email may already exist."},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error('Unexpected registration error: %s', str(e))
        logger.error(traceback.format_exc())
        return Response(
            {"error": "Registration failed. Please try again later.", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    if request.method == 'GET':
        return Response({
            'message': 'Please submit registration data using POST method',
            'required_fields': {
                'user': {
                    'username': 'string',
                    'email': 'string (@mak.ac.ug email)',
                    'password': 'string (min 8 characters)',
                    'first_name': 'string',
                    'last_name': 'string',
                    'role_name': 'string'
                },
                'employee_id': 'string',
                'department': 'string',
                'college': 'string',
                'contact_number': 'string (10 digits, starts with 07)',
                'position': 'string'
            }
        }, status=status.HTTP_200_OK)
        
    logger.info("Incoming lecturer registration data: %s", request.data)
    
    try:
        with transaction.atomic():
            # Validate email domain
            email = request.data.get('user', {}).get('email', '')
            if not email.endswith('@mak.ac.ug'):
                return Response({
                    'error': 'Invalid email domain. Please use your Makerere University email (@mak.ac.ug).'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate contact number
            contact_number = request.data.get('contact_number', '')
            if not contact_number.startswith('07') or not contact_number.isdigit() or len(contact_number) != 10:
                return Response({
                    'error': 'Invalid contact number. Please provide a 10-digit phone number starting with 07.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate password length
            password = request.data.get('user', {}).get('password', '')
            if len(password) < 8:
                return Response({
                    'error': 'Password must be at least 8 characters long.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = LecturerSerializer(data=request.data)
            
            if not serializer.is_valid():
                logger.warning("Validation errors: %s", serializer.errors)
                return Response(
                    {"error": "Validation failed", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for existing employee_id or email
            employee_id = serializer.validated_data.get('employee_id')
            if Lecturer.objects.filter(employee_id=employee_id).exists():
                return Response(
                    {"error": "Employee ID already exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if User.objects.filter(email=email).exists():
                return Response(
                    {"error": "Email already registered."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the lecturer
            try:
                lecturer = serializer.save()
                logger.info("Created lecturer: %s", lecturer)
                
                # Create email verification
                verification = EmailVerification.objects.create(
                    user=lecturer.user,
                    expires_at=timezone.now() + timedelta(minutes=30)
                )
                verification_code = verification.generate_code()
                verification.save()
                
                logger.info("Generated verification code for %s", lecturer.user.email)
                
                # Send verification email
                try:
                    send_mail(
                        'Verify your email - Lecturer Registration',
                        f'''Welcome to the Academic Issue Tracking System!

Your verification code is: {verification_code}

This code will expire in 30 minutes.

Please use this code to verify your email and activate your Lecturer account.
''',
                        settings.EMAIL_HOST_USER,
                        [lecturer.user.email],
                        fail_silently=False,
                    )
                    
                    # Generate tokens
                    refresh = RefreshToken.for_user(lecturer.user)
                    
                    return Response({
                        'success': True,
                        'message': 'Lecturer registered successfully! Check your email for verification.',
                        'tokens': {
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                        }
                    }, status=status.HTTP_201_CREATED)
                    
                except Exception as e:
                    logger.error("Failed to send verification email: %s", str(e))
                    raise Exception("Failed to send verification email")
                    
            except IntegrityError as e:
                logger.error("Database integrity error: %s", str(e))
                return Response(
                    {"error": "Database error. This employee ID or email may already exist."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
    except Exception as e:
        logger.error("Unexpected registration error: %s", str(e))
        return Response(
            {"error": "Registration failed. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
      
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def register_administrator(request):
    if request.method == 'GET':
        return Response({
            'message': 'Please submit registration data using POST method',
            'required_fields': {
                'user': {
                    'username': 'string',
                    'email': 'string',
                    'password': 'string',
                    'first_name': 'string',
                    'last_name': 'string',
                    'role_name': 'string'
                },
                'contact_number': 'string (10-digit phone number)'
            }
        }, status=status.HTTP_200_OK)

    logger.info("Incoming administrator registration data: %s", request.data)

    try:
        with transaction.atomic():
            # Ensure the administrator role exists and inject its PK
            admin_role, _ = UserRole.objects.get_or_create(role_name='admin')
            data = request.data.copy()
            if 'user' not in data:
                data['user'] = {}
            data['user']['role'] = admin_role.id

            # Validate contact number format
            contact_number = data.get('contact_number', '')
            if not (contact_number.isdigit() and len(contact_number) == 10):
                return Response(
                    {"error": "Invalid contact number. Please provide a 10-digit phone number."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = AdministratorSerializer(data=data)
            if not serializer.is_valid():
                logger.warning("Validation errors: %s", serializer.errors)
                return Response(
                    {"error": "Validation failed", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check for existing contact number or email
            if Administrator.objects.filter(contact_number=contact_number).exists():
                return Response(
                    {"error": "An administrator with this contact number already exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            email = data['user'].get('email', '')
            if User.objects.filter(email=email).exists():
                return Response(
                    {"error": "Email already registered."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create the administrator
            administrator = serializer.save()
            logger.info("Created administrator: %s", administrator)

            # Create email verification
            verification = EmailVerification.objects.create(
                user=administrator.user,
                expires_at=timezone.now() + timedelta(minutes=30)
            )
            verification_code = verification.generate_code()
            verification.save()

            logger.info("Generated verification code for %s", administrator.user.email)

            # Send verification email
            try:
                send_mail(
                    'Verify your email - Admin Registration',
                    f"""Welcome to the Academic Issue Tracking System!

As an Academic Registrar, you will be responsible for managing and assigning academic issues.

Your verification code is: {verification_code}

This code will expire in 30 minutes.

Please use this code to verify your email and activate your administrator account.
""",
                    settings.EMAIL_HOST_USER,
                    [administrator.user.email],
                    fail_silently=False,
                )
            except Exception as e:
                logger.error("Failed to send verification email: %s", str(e))
                raise

            # Generate tokens
            refresh = RefreshToken.for_user(administrator.user)
            return Response({
                'success': True,
                'message': 'Administrator registered successfully! Check your email for verification.',
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

    except IntegrityError as e:
        logger.error("Database integrity error: %s", str(e))
        return Response(
            {"error": "Database error. This contact number or email may already exist."},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error("Unexpected registration error: %s", str(e))
        logger.error(traceback.format_exc())
        return Response(
            {"error": "Registration failed. Please try again later.", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

from django.utils import timezone

import logging
logger = logging.getLogger(__name__)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    logger.debug("🔑 Login payload: %r", request.data)
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Return the logged-in user's data.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

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
@permission_classes([IsAuthenticated])
def issue_list(request):
    issues = Issue.objects.all()
    serializer = IssueSerializer(issues, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_issue(request):
    try:
        # Check if user is a student
        if not hasattr(request.user, 'student_profile'):
            return Response({'error': 'Only students can create issues.'}, status=403)

        # Add the student to the issue data
        issue_data = request.data.copy()
        issue_data['student'] = request.user.id
        
        # Create initial status
        initial_status, _ = Status.objects.get_or_create(status_name='Open')
        issue_data['status'] = initial_status.id

        serializer = IssueSerializer(data=issue_data)
        if serializer.is_valid():
            issue = serializer.save()
            
            # Create notification for admin
            admin_notification = Notification.objects.create(
                issue=issue,
                message=f'New academic issue submitted: {issue.title}',
                notification_type='info'
            )
            
            # Create notification for student
            student_notification = Notification.objects.create(
                issue=issue,
                message=f'Your issue "{issue.title}" has been submitted successfully',
                notification_type='info'
            )
            
            # Email student confirmation
            student_email = f'''Hello {request.user.get_full_name()},

Your academic issue has been submitted successfully:

Title: {issue.title}
Description: {issue.description}
Priority: {issue.priority}
Status: Pending

You will receive notifications as your issue is processed.
You can track the status of your issue in the Academic Issue Tracking System.
'''
            send_mail(
                'Issue Submitted Successfully',
                student_email,
                settings.EMAIL_HOST_USER,
                [request.user.email],
                fail_silently=False,
            )
            
            # Email admins about new issue
            admins = User.objects.filter(role__role_name='administrator')
            for admin in admins:
                admin_email = f'''Hello {admin.get_full_name()},

A new academic issue has been submitted:

Title: {issue.title}
Student: {request.user.get_full_name()}
Priority: {issue.priority}
Description: {issue.description}

Please review and assign this issue to an appropriate lecturer.
'''
                send_mail(
                    'New Academic Issue Submitted',
                    admin_email,
                    settings.EMAIL_HOST_USER,
                    [admin.email],
                    fail_silently=False,
                )
            
            logger.info(f"Issue created: {issue.title} by {request.user.username}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        logger.warning(f"Issue creation validation failed: {serializer.errors}")
        return Response(
            {
                'error': 'Validation failed',
                'details': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
  
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
@permission_classes([IsAuthenticated])
def get_notifications(request):
    try:
        user = request.user
        
        # First check if user exists and has a role
        if not user:
            return Response(
                {'error': 'No authenticated user found'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not hasattr(user, 'role') or not user.role or not user.role.role_name:
            return Response(
                {'error': 'User role not configured properly'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        role = user.role.role_name.lower()  # Convert to lowercase for consistent comparison
        
        # Base queryset with select_related for better performance
        notifications = Notification.objects.select_related(
            'issue', 
            'issue__student', 
            'issue__assigned_to',
            'issue__status'
        ).prefetch_related(
            'issue__notifications'
        )
        
        # Query notifications based on role
        if role == 'student':
            # Get notifications for issues reported by this student
            notifications = notifications.filter(issue__student=user)
        elif role == 'lecturer':
            # Get notifications for issues assigned to this lecturer
            notifications = notifications.filter(issue__assigned_to=user)
        elif role in ['administrator', 'admin']:
            # Admins see all notifications, no filter needed
            pass
        else:
            return Response(
                {"error": f"Invalid user role: {role}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Order by created_at and limit to recent notifications
            notifications = notifications.order_by('-created_at')[:100]
            serializer = NotificationSerializer(notifications, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            import logging
            logger = logging.getLogger('Apps')
            logger.error(f"Error serializing notifications: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error retrieving notifications. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except Exception as e:
        import logging
        logger = logging.getLogger('Apps')
        logger.error(f"Error in get_notifications view: {str(e)}", exc_info=True)
        
        if 'role' in str(e):
            return Response(
                {'error': 'User role not configured properly'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            {'error': 'An error occurred while retrieving notifications'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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


# Apps/views.py

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from .models import LoginHistory

User = get_user_model()

class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allow users to log in with either their username or their email address.
    """

    def validate(self, attrs):
        login_input = attrs.get(self.username_field)
        password    = attrs.get('password')

        # 1. Find the user by username *or* email (case-insensitive)
        try:
            user_obj = User.objects.get(
                Q(username__iexact=login_input) |
                Q(email__iexact=login_input)
            )
        except User.DoesNotExist:
            raise AuthenticationFailed(
                'No active account found with the given credentials',
                'no_active_account'
            )

        # 2. Check password
        if not user_obj.check_password(password):
            raise AuthenticationFailed(
                'No active account found with the given credentials',
                'no_active_account'
            )

        # 3. “Prime” attrs so super().validate() sees the correct username
        attrs[self.username_field] = getattr(user_obj, self.username_field)

        # 4. Call the parent to do the real token creation
        data = super().validate(attrs)

        # 5. Record login history
        request = self.context['request']
        ip = (
            request.META.get('HTTP_X_FORWARDED_FOR', '')
            .split(',')[0] or
            request.META.get('REMOTE_ADDR', '127.0.0.1')
        )
        LoginHistory.objects.create(
            user=user_obj,
            ip_address=ip,
            session_time=timezone.now(),
        )

        return data


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer

# --- ADMIN: Assign Issue to Lecturer ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_issue_to_lecturer(request):
    if not hasattr(request.user, 'role') or request.user.role.role_name.lower() != 'admin':
        return Response({'error': 'Only admin can assign issues.'}, status=403)
    issue_id = request.data.get('issue_id')
    lecturer_id = request.data.get('lecturer_id')
    try:
        issue = Issue.objects.get(id=issue_id)
        lecturer = Lecturer.objects.get(id=lecturer_id)
        issue.assigned_to = lecturer.user
        
        # Update status
        status_obj, _ = Status.objects.get_or_create(status_name='Assigned')
        old_status = issue.status
        issue.status = status_obj
        issue.save()
        
        # Create notification for lecturer
        Notification.objects.create(
            issue=issue,
            message=f'You have been assigned a new issue: {issue.title}',
            notification_type='info'
        )
        
        # Create notification for student about assignment
        Notification.objects.create(
            issue=issue,
            message=f'Your issue "{issue.title}" has been assigned to {lecturer.user.get_full_name()}',
            notification_type='info'
        )
        
        # Email lecturer
        lecturer_email = f'''Hello {lecturer.user.get_full_name()},

You have been assigned a new academic issue that requires your attention:

Issue Title: {issue.title}
Student: {issue.student.get_full_name()}
Description: {issue.description}

Please log in to the Academic Issue Tracking System to review and resolve this issue.
'''
        send_mail(
            'New Academic Issue Assigned',
            lecturer_email,
            settings.EMAIL_HOST_USER,
            [lecturer.user.email],
            fail_silently=False,
        )
        
        # Email student about assignment
        student_email = f'''Hello {issue.student.get_full_name()},

Your academic issue "{issue.title}" has been assigned to {lecturer.user.get_full_name()}.
The issue status has been updated from "{old_status}" to "Assigned".

You can track the progress of your issue in the Academic Issue Tracking System.
'''
        send_mail(
            'Issue Update: Assigned to Lecturer',
            student_email,
            settings.EMAIL_HOST_USER,
            [issue.student.email],
            fail_silently=False,
        )
        return Response({'success': True, 'message': 'Issue assigned to lecturer.'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)

# --- LECTURER: Update Issue Status ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_issue_status(request):
    issue_id = request.data.get('issue_id')
    new_status = request.data.get('status')
    resolution_notes = request.data.get('resolution_notes', '')
    attachments = request.data.get('attachments', [])
    
    try:
        issue = Issue.objects.get(id=issue_id)
        
        # Only assigned lecturer can update
        if issue.assigned_to != request.user:
            return Response({
                'error': 'Not allowed. Only the assigned lecturer can update the issue status.'
            }, status=403)
        
        old_status = issue.status.status_name if issue.status else 'Unknown'
        
        # Create or get status object
        status_obj, _ = Status.objects.get_or_create(status_name=new_status)
        issue.status = status_obj
        issue.save()
        
        # Determine notification type based on status
        notification_type = 'info'
        if new_status.lower() == 'resolved':
            notification_type = 'success'
        elif new_status.lower() == 'pending information':
            notification_type = 'warning'
        elif new_status.lower() == 'closed':
            notification_type = 'info'
            
        # Create notification for student
        Notification.objects.create(
            issue=issue,
            message=f'Your issue "{issue.title}" status has been updated to {new_status}.\n\nNotes: {resolution_notes}',
            notification_type=notification_type
        )
        
        # Email student with detailed update
        status_context = {
            'Pending Information': 'additional information is required',
            'In Progress': 'being worked on',
            'Resolved': 'been resolved',
            'Closed': 'been closed'
        }.get(new_status, 'been updated')
        
        email_content = f"""Hello {issue.student.get_full_name()},

Your academic issue has {status_context}:

Title: {issue.title}
Previous Status: {old_status}
New Status: {new_status}

Additional Notes:
{resolution_notes if resolution_notes else "No additional notes provided"}

Next Steps:
{
    "Please provide the requested additional information." if new_status == "Pending Information"
    else "No further action is required." if new_status in ["Resolved", "Closed"]
    else "You will receive updates as your issue progresses."
}

You can view the full details and track this issue's progress in the Academic Issue Tracking System.
"""
        
        send_mail(
            f'Issue Update: {issue.title}',
            email_content,
            settings.EMAIL_HOST_USER,
            [issue.student.email],
            fail_silently=False,
        )
        
        # If issue is resolved or closed, notify admin
        if new_status.lower() in ['resolved', 'closed']:
            admin_notification = Notification.objects.create(
                issue=issue,
                message=f'Issue "{issue.title}" has been {new_status.lower()} by {request.user.get_full_name()}',
                notification_type='info'
            )
            
            # Notify admins via email
            admins = User.objects.filter(role__role_name='administrator')
            for admin in admins:
                send_mail(
                    f'Issue {new_status}: {issue.title}',
                    f"""Hello {admin.get_full_name()},

The following academic issue has been {new_status.lower()}:

Title: {issue.title}
{new_status} By: {request.user.get_full_name()}
Student: {issue.student.get_full_name()}

Resolution Notes:
{resolution_notes if resolution_notes else "No additional notes provided"}

You can review the details in the Academic Issue Tracking System.
""",
                    settings.EMAIL_HOST_USER,
                    [admin.email],
                    fail_silently=False,
                )
        
        return Response({
            'success': True,
            'message': f'Issue status updated to {new_status}.',
            'notification_created': True
        })
    
    except Issue.DoesNotExist:
        return Response({'error': 'Issue not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating issue status: {str(e)}")
        return Response({'error': str(e)}, status=500)

# --- STUDENT: List Own Issues (Issue Tracking) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_issues(request):
    try:
        # Verify user is a student
        if not hasattr(request.user, 'student_profile'):
            return Response({'error': 'Only students can view their issues.'}, status=403)
        
        # Get all issues for the student with related fields
        issues = Issue.objects.select_related('status', 'assigned_to').filter(
            student=request.user
        ).order_by('-reported_date')

        serializer = IssueSerializer(issues, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- ADMIN: Statistics Endpoint ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_statistics(request):
    if not hasattr(request.user, 'role') or request.user.role.role_name.lower() != 'admin':
        return Response({'error': 'Only admin can view statistics.'}, status=403)
    total_issues = Issue.objects.count()
    by_status = Issue.objects.values('status__status_name').annotate(count=models.Count('id'))
    by_lecturer = Issue.objects.values('assigned_to__username').annotate(count=models.Count('id'))
    return Response({
        'total_issues': total_issues,
        'issues_by_status': list(by_status),
        'issues_by_lecturer': list(by_lecturer),
    })
