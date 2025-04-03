from rest_framework.decorators import api_view, permission_classes
from rest_framework import viewsets, generics,mixins, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import exception_handler
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate
import uuid

from .models import User, Student, Lecturer, Administrator, Issue, Notification, Status, LoginHistory, UserRole
from .serializer import (
    UserSerializer, StudentSerializer, LecturerSerializer, AdministratorSerializer,
    IssueSerializer, NotificationSerializer, StatusSerializer, LoginHistorySerializer, 
    UserRoleSerializer, UserRegistrationSerializer, VerifyEmailSerializer, LoginSerializer
)
from .filters import IssueFilter
from django_filters.rest_framework import DjangoFilterBackend
from .forms import (
    StudentForm, LecturerForm, AdministratorForm, IssueForm,
    NotificationForm, StatusForm, CourseUnitForm
)
from django.contrib.auth.hashers import make_password


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Registers a new user
    Expected POST data:
    {
        "username":"string",
        "email":"string",
        "password":"string"
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Send verification email
        verification_link = f"{settings.FRONTEND_URL}/verify-email/{user.verification_token}/"
        send_mail(
            'Verify your email',
            f'Click this link to verify your email: {verification_link}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'User registered successfully. Please check your email for verification.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    serializer = VerifyEmailSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        try:
            user = User.objects.get(verification_token=token)
            if user.verification_token_expires < timezone.now():
                return Response({'error': 'Verification token expired'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.is_verified = True
            user.save()
            return Response({'message': 'Email verified successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """
    Authenticates a user and returns JWT tokens
    Expected POST data:
    {
        "username":"string",
        "password":"string"
    }
    """
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
    #Gets the user from serializer validation
        user = serializer.validated_data
    #Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
    #Record login time
        user.last_login = timezone.now()
        user.save()

        return Response({
            'refresh': str(refresh),
            'access': str(access_token),
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# DRF Viewsets
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('user').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.select_related('user').all()
    serializer_class = LecturerSerializer
    permission_classes = [IsAuthenticated]

class AdministratorViewSet(viewsets.ModelViewSet):
    queryset = Administrator.objects.select_related('user').all()
    serializer_class = AdministratorSerializer
    permission_classes = [IsAuthenticated]

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.select_related('student', 'lecturer', 'status').all()
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = IssueFilter
    search_fields = ['title', 'description']
    ordering_fields = ['reported_date', 'priority']

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.select_related('issue').all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer
    permission_classes = [IsAuthenticated]

class LoginHistoryViewSet(viewsets.ModelViewSet):
    queryset = LoginHistory.objects.select_related('user').all()
    serializer_class = LoginHistorySerializer
    pagination_class = PageNumberPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return LoginHistory.objects.all()
        return LoginHistory.objects.filter(user=user)

class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated]

class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint for user registration.

    Handles:
    - User creation
    - Password hashing
    - Email verification (optional)
    - Response formatting
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = []#Allow any to register
    throttle_classes = [AnonRateThrottle] #5 requests/hour by default

    def create(self, request,*args,**kwargs):
        """
        Custom create method to handle:
        1.Password hashing
        2.Email verification setup
        3.Custom response format
        """
        data = request.data.copy()
        if 'password' in data:
            data['password'] = make_password(data['password'])
        #Set default role if not provided(ie 'student')
        if 'role' not in data:
            data['role'] = UserRole.objects.get(role_name='student').id

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            user = serializer.save()
        #Send verification email(optional)
            self._send_verification_email(user)

            return Response(
                {
                    "status":"success",
                    "message":"User registered successfully",
                    "data": {
                        "user":serializer.data,
                        "next_steps": "Check your email for verification" if settings.EMAIL_VERIFICATION else None
                    }
                },
                status=status.HTTP_201_CREATED
            )
            return Response(
                {
                    "status":"error",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
    def _send_verification_email(self, user):
        """
        Helper method to send verification email
        """
        if settings.EMAIL_VERIFICATION and user.email:
            verification_link = f"{settings.FRONTEND_URL}/verify-email/{user.verification_token}/"
            send_mail(
                'Verify your email',
                f'Click this link to verify your email:{verification_link}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )

# Template Views
def issue_list(request):
    issues = Issue.objects.select_related('student', 'lecturer', 'status').all()
    return render(request, 'issues/issue_list.html', {'issues': issues})

def create_issue(request):
    if request.method == "POST":
        form = IssueForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('issue_list')
    else:
        form = IssueForm()
    return render(request, 'issues/issue_form.html', {'form': form})

def update_issue(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id)
    if request.method == "POST":
        form = IssueForm(request.POST, instance=issue)
        if form.is_valid():
            form.save()
            return redirect('issue_list')
    else:
        form = IssueForm(instance=issue)
    return render(request, 'issues/issue_form.html', {'form': form})

def delete_issue(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id)
    if request.method == "POST":
        issue.delete()
        return redirect('issue_list')
    return render(request, 'issues/issue_confirm_delete.html', {'issue': issue})

def student_list(request):
    students = Student.objects.select_related('user').all()
    return render(request, 'students/student_list.html', {'students': students})

def update_student(request, student_id):
    student = get_object_or_404(Student, id=student_id)
    if request.method == "POST":
        form = StudentForm(request.POST, instance=student)
        if form.is_valid():
            form.save()
            return redirect('student_list')
    else:
        form = StudentForm(instance=student)
    return render(request, 'students/student_form.html', {'form': form})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def filter_issues(request):
    status = request.GET.get('status', None)
    issues_qs = Issue.objects.all()
    if status:
        issues_qs = issues_qs.filter(status=status)
    serializer = IssueSerializer(issues_qs, many=True)
    return Response(serializer.data)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        response.data['status_code'] = response.status_code
    return response