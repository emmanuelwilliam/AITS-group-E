from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.db import transaction, IntegrityError
from django.db.models import Q, F, Avg, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
import logging
import traceback

# Import your models
from .models import (
    User, Student, Lecturer, Administrator, Issue, 
    Notification, Status, LoginHistory, UserRole, 
    PasswordResetToken, EmailVerification
)

logger = logging.getLogger(__name__)

# Authentication Serializers
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                return data  # Return the validated data instead of user
            raise serializers.ValidationError("Unable to log in with provided credentials.")
        raise serializers.ValidationError("Must include 'username' and 'password'.")


class UserRegistrationSerializer(serializers.Serializer):
    # User fields
    username           = serializers.CharField()
    email              = serializers.EmailField()
    password           = serializers.CharField(write_only=True)
    confirm_password   = serializers.CharField(write_only=True)
    first_name         = serializers.CharField()
    last_name          = serializers.CharField()
    # Student fields
    college            = serializers.CharField()
    student_number     = serializers.CharField()
    registration_number= serializers.CharField()
    course             = serializers.CharField()

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Username already taken.")
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already registered.")
        return data

    def create(self, validated_data):
        # 1) Pop student fields
        college            = validated_data.pop('college')
        student_number     = validated_data.pop('student_number')
        registration_number= validated_data.pop('registration_number')
        course             = validated_data.pop('course')
        validated_data.pop('confirm_password')

        # 2) Get or create student role
        student_role, _ = UserRole.objects.get_or_create(
            role_name='student',
            defaults={'name': 'Student'}
        )

        # 3) Create User
        user = User(
            username   = validated_data['username'],
            email      = validated_data['email'],
            first_name = validated_data['first_name'],
            last_name  = validated_data['last_name'],
            role       = student_role,
            is_active  = False,  # pending email verification
        )
        user.set_password(validated_data['password'])
        user.save()

        # 4) Create Student profile
        Student.objects.create(
            user               = user,
            college            = college,
            student_number     = student_number,
            registration_number= registration_number,
            course             = course
        )

        return user

# Email Verification Serializer
class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField(max_length=50)

# Role Serializer
class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', 'role_name']
        
# Model Serializers
class UserSerializer(serializers.ModelSerializer):
    role = UserRoleSerializer(read_only=True)
    role_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'role_name']
    
    def create(self, validated_data):
        role_name = validated_data.pop('role_name', None)
        password = validated_data.pop('password')

        # Handle role assignment if necessary
        if role_name:
            role = UserRole.objects.get(role_name=role_name)
            validated_data['role'] = role

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# Profile Serializers
class StudentSerializer(serializers.ModelSerializer):
      user = UserSerializer()

      class Meta:
          model = Student
          fields = ['user', 'college', 'course', 'student_number', 'registration_number']
  
      def create(self, validated_data):
          user_data = validated_data.pop('user')
          user_data['role_name'] = 'student'  # Force role to student
      
          # Use UserSerializer to create the user correctly
          user_serializer = UserSerializer(data=user_data)
          user_serializer.is_valid(raise_exception=True)
          user = user_serializer.save()
      
          student = Student.objects.create(user=user, **validated_data)
          return student


      def validate_student_number(self, value):
          if Student.objects.filter(student_number=value).exists():
              raise serializers.ValidationError("Student number already exists. Please provide a unique student number.")
          return value

# Serializer for the Lecturer model, including a nested UserSerializer with a depth of 1.
class LecturerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
       model = Lecturer
       fields ='__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role_name'] = 'lecturer'  # Force role
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()
        lecturer = Lecturer.objects.create(user=user, **validated_data)
        return lecturer

class AdministratorSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Administrator
        fields = '__all__'
        depth = 1

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role_name'] = 'administrator'  # Force role

        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        administrator = Administrator.objects.create(user=user, **validated_data)
        return administrator


# Issue Tracking Serializers
class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

# Serializer for handling issue data, including related student, Lecturer, and status information.
class IssueSerializer(serializers.ModelSerializer):
    status_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'college', 'program',
            'year_of_study', 'semester', 'course_unit', 'course_code',
            'category', 'reported_date', 'priority', 'student',
            'assigned_to', 'status', 'status_name', 'student_name',
            'assigned_to_name'
        ]

    def get_status_name(self, obj):
        return obj.status.status_name if obj.status else 'Open'

    def get_student_name(self, obj):
        if obj.student:
            return f"{obj.student.first_name} {obj.student.last_name}"
        return None

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}"
        return None

# Serializer for Notification model with related issue data.
class NotificationSerializer(serializers.ModelSerializer):
    issue_title = serializers.SerializerMethodField()
    issue_status = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    assigned_to = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'message', 'notification_type', 'is_read', 'created_at',
            'issue', 'issue_title', 'issue_status', 'student_name', 'assigned_to'
        ]

    def get_issue_title(self, obj):
        return obj.issue.title if obj.issue else None

    def get_issue_status(self, obj):
        if obj.issue and obj.issue.status:
            return obj.issue.status.status_name
        return None

    def get_student_name(self, obj):
        if obj.issue and obj.issue.student:
            return f"{obj.issue.student.first_name} {obj.issue.student.last_name}".strip()
        return None

    def get_assigned_to(self, obj):
        if obj.issue and obj.issue.assigned_to:
            return f"{obj.issue.assigned_to.first_name} {obj.issue.assigned_to.last_name}".strip()
        return None

class LoginHistorySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = LoginHistory
        fields = '__all__'
        read_only_fields = ['login_time']

# Password Reset Serializers
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return value

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email doesn't exist.")

    def validate(self, attrs):
        if 'email' not in attrs or 'password' not in attrs:
            raise serializers.ValidationError("Both email and password are required.")
        return attrs

    def save(self):
        email = self.validated_data['email']
        new_password = self.validated_data['password']
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            LoginHistory.objects.create(user=user)
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Error resetting password: {str(e)}")

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return value

    def save(self):
        token = self.validated_data['token']
        new_password = self.validated_data['new_password']

        try:
            password_reset_token = PasswordResetToken.objects.get(token=token)
            user = password_reset_token.user

            if password_reset_token.is_expired:
                raise serializers.ValidationError("This token has expired.")

            user.set_password(new_password)
            user.save()
            LoginHistory.objects.create(user=user)
            return user

        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired token.")
        except Exception as e:
            raise serializers.ValidationError(f"Error resetting password: {str(e)}")

    def validate(self, attrs):
        login_input = attrs.get(self.username_field)
        password = attrs.get('password')

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

        # 2. Check password and active status
        if not user_obj.check_password(password):
            raise AuthenticationFailed(
                'No active account found with the given credentials',
                'no_active_account'
            )
            
        if not user_obj.is_active:
            raise AuthenticationFailed(
                'Account is not active. Please verify your email.',
                'inactive_account'
            )

        # 3. \"Prime\" attrs so super().validate() sees the correct username
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

class StudentRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        logger.info('Incoming student registration data: %s', request.data)
        
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
                    
                # Create student
                student = serializer.save()
                
                # Create email verification
                verification = EmailVerification.objects.create(
                    user=student.user,
                    expires_at=timezone.now() + timedelta(minutes=30)
                )
                verification_code = verification.generate_code()
                verification.save()
                
                # Send verification email
                try:
                    send_mail(
                        'Verify your email - Student Registration',
                        f'Welcome to the Academic Issue Tracking System!\n\nPlease verify your email: {verification_code}',
                        'noreply@yourdomain.com',
                        [student.user.email],
                        fail_silently=False,
                    )
                    logger.info('Verification email sent to %s', student.user.email)
                except Exception as e:
                    logger.error('Error sending email: %s', str(e))
                    return Response(
                        {'error': 'Failed to send verification email.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
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

class IssueAssignmentView(APIView):
    def post(self, request, *args, **kwargs):
        issue_id = request.data.get('issue_id')
        lecturer_id = request.data.get('lecturer_id')

        if not issue_id or not lecturer_id:
            return Response({
                'error': 'Please provide both issue_id and lecturer_id'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            issue = Issue.objects.get(id=issue_id)
            lecturer = Lecturer.objects.get(id=lecturer_id)
            
            # Update issue
            issue.assigned_to = lecturer.user
            issue.save()
            
            # Send email notification
            send_mail(
                'Issue Assignment Notification',
                f"""Hello {issue.student.get_full_name()},
                Your issue "{issue.title}" has been assigned to {lecturer.user.get_full_name()}. 
                The lecturer will contact you soon regarding your issue.

                Best regards,
                The Academic Issue Tracking System Team""",
                'noreply@yourdomain.com',
                [issue.student.user.email],
                fail_silently=False,
            )

            return Response({
                'success': True,
                'message': f'Issue successfully assigned to {lecturer.user.get_full_name()}'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error assigning issue: {str(e)}")
            return Response({
                'error': 'Failed to assign issue',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class IssueStatusView(APIView):
    def put(self, request, *args, **kwargs):
        issue_id = request.data.get('issue_id')
        new_status = request.data.get('status')

        if not all([issue_id, new_status]):
            return Response({
                'error': 'Please provide both issue_id and status'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            issue = Issue.objects.get(id=issue_id)
            old_status = issue.status.status_name
            
            # Check permissions
            if not (hasattr(request.user, 'lecturer') or hasattr(request.user, 'administrator')):
                return Response({
                    'error': 'Only lecturers and administrators can update issue status'
                }, status=status.HTTP_403_FORBIDDEN)
                
            if hasattr(request.user, 'lecturer') and issue.assigned_to != request.user:
                return Response({
                    'error': 'You can only update issues assigned to you'
                }, status=status.HTTP_403_FORBIDDEN)
                
            # Update status
            new_status_obj, _ = Status.objects.get_or_create(status_name=new_status)
            issue.status = new_status_obj
            issue.save()
            
            # Create notification
            status_context = 'been updated' if new_status != 'Resolved' else 'been resolved'
            
            notification = Notification.objects.create(
                issue=issue,
                message=f'Issue status updated from {old_status} to {new_status}',
                notification_type='info'
            )
            
            # Send email notification
            next_steps = {
                'Pending Information': 'Please provide the requested additional information.',
                'In Progress': 'Your issue is being actively worked on.',
                'Resolved': 'No further action is required.',
                'Closed': 'This issue has been closed.'
            }.get(new_status, 'Please check the system for updates.')
            
            send_mail(
                'Issue Status Update',
                f'''Hello {issue.student.get_full_name()},
Your issue "{issue.title}" has {status_context} to "{new_status}".

{next_steps}

Best regards,
The Academic Issue Tracking System Team''',
                'noreply@yourdomain.com',
                [issue.student.user.email],
                fail_silently=False,
            )

            return Response({
                'success': True,
                'message': f'Issue status updated to {new_status}'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error updating issue status: {str(e)}")
            return Response({
                'error': 'Failed to update issue status',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StudentIssuesView(APIView):
    def get(self, request):
        try:
            issues = Issue.objects.select_related(
                'status', 'assigned_to'
            ).prefetch_related(
                'notifications'
            ).filter(
                student=request.user
            ).order_by('-reported_date')

            serializer = IssueSerializer(issues, many=True)
            return Response({
                'success': True,
                'issues': serializer.data
            })

        except Exception as e:
            logger.error(f'Error fetching student issues: {str(e)}')
            return Response({
                'error': 'Failed to fetch issues',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminStatisticsView(APIView):
    def get(self, request):
        try:
            # Get current time for time-based queries
            now = timezone.now()
            last_month = now - timedelta(days=30)
            last_week = now - timedelta(days=7)

            # Basic statistics
            total_issues = Issue.objects.count()
            open_issues = Issue.objects.filter(status__status_name='Open').count()
            resolved_issues = Issue.objects.filter(status__status_name='Resolved').count()
            pending_issues = Issue.objects.filter(status__status_name='Pending Information').count()

            # Time-based statistics
            new_issues_month = Issue.objects.filter(reported_date__gte=last_month).count()
            new_issues_week = Issue.objects.filter(reported_date__gte=last_week).count()
            resolved_month = Issue.objects.filter(
                status__status_name='Resolved',
                status__updated_at__gte=last_month
            ).count()

            # User statistics
            total_students = Student.objects.count()
            total_lecturers = Lecturer.objects.count()
            active_students = Student.objects.filter(user__last_login__gte=last_month).count()
            active_lecturers = Lecturer.objects.filter(user__last_login__gte=last_month).count()

            # Priority distribution
            priority_distribution = Issue.objects.values('priority').annotate(
                count=Count('id')
            )

            # College statistics
            college_distribution = Issue.objects.values('student__college').annotate(
                count=Count('id')
            )

            # Response time statistics
            avg_response_time = Issue.objects.filter(
                assigned_to__isnull=False
            ).aggregate(
                avg_time=Avg(F('first_response_time') - F('reported_date'))
            )['avg_time']

            return Response({
                'success': True,
                'statistics': {
                    'total_issues': total_issues,
                    'open_issues': open_issues,
                    'resolved_issues': resolved_issues,
                    'pending_issues': pending_issues,
                    'new_issues_month': new_issues_month,
                    'new_issues_week': new_issues_week,
                    'resolved_month': resolved_month,
                    'user_stats': {
                        'total_students': total_students,
                        'total_lecturers': total_lecturers,
                        'active_students': active_students,
                        'active_lecturers': active_lecturers
                    },
                    'priority_distribution': list(priority_distribution),
                    'college_distribution': list(college_distribution),
                    'avg_response_time': avg_response_time.total_seconds() if avg_response_time else None
                }
            })

        except Exception as e:
            logger.error(f'Error generating admin statistics: {str(e)}')
            return Response({
                'error': 'Failed to generate statistics',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
