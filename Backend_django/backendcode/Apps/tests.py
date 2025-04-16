from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from .models import AcademicIssue, Department, Course

class AcademicIssueTests(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        # Create test department
        self.department = Department.objects.create(
            name='Computer Science',
            description='Computer Science Department'
        )
        # Create test course
        self.course = Course.objects.create(
            code='CS101',
            name='Introduction to Programming',
            department=self.department
        )
        # Create test issue
        self.issue = AcademicIssue.objects.create(
            title='Test Issue',
            description='This is a test issue',
            reported_by=self.user,
            course=self.course,
            status='OPEN'
        )
        # Login the test user
        self.client.login(username='testuser', password='testpass123')

   def test_issue_creation(self):
    """Test that an academic issue can be created"""
    
    # Validate that all key fields of the created issue match expected values
    self.assertEqual(self.issue.title, 'Test Issue')
    self.assertEqual(self.issue.description, 'This is a test issue')
    self.assertEqual(self.issue.reported_by, self.user)
    self.assertEqual(self.issue.course, self.course)
    self.assertEqual(self.issue.status, 'OPEN')


    def test_issue_list_view(self):
        """Test that issues list view returns 200"""
        response = self.client.get(reverse('issue-list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'issues/issue_list.html')
        self.assertContains(response, 'Test Issue') 

   def test_issue_detail_view(self):
    """Test that issue detail view returns 200"""
    # Ensure the issue detail page loads successfully with correct template
    response = self.client.get(reverse('issue-detail', args=[self.issue.id]))
    self.assertEqual(response.status_code, 200)
    self.assertTemplateUsed(response, 'issues/issue_detail.html')


    def test_issue_update(self):
    """Test that an issue can be updated"""
    
    new_title = 'Updated Test Issue'
    
    # Send a POST request to update the issue with a new title and existing data
    response = self.client.post(reverse('issue-update', args=[self.issue.id]), {
        'title': new_title,
        'description': self.issue.description,
        'course': self.course.id,
        'status': self.issue.status
    })

        self.assertEqual(response.status_code, 302)  # Redirect after successful update
        self.issue.refresh_from_db()
        self.assertEqual(self.issue.title, new_title)

   def test_issue_status_change(self):
    """Test that issue status can be changed"""
    
    new_status = 'IN_PROGRESS'
    
    # Simulate a status update via POST request and verify the change
    response = self.client.post(reverse('issue-update', args=[self.issue.id]), {
        'title': self.issue.title,
        'description': self.issue.description,
        'course': self.course.id,
        'status': new_status
    })
    
    self.assertEqual(response.status_code, 302)  # Redirect after successful update
    self.issue.refresh_from_db()
    self.assertEqual(self.issue.status, new_status)


