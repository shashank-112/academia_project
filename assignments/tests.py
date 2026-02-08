from django.test import TestCase
from django.utils import timezone
from students.models import Student
from faculty.models import Faculty, FacultyAssignment
from .models import Assignment


class AssignmentModelTestCase(TestCase):
    def setUp(self):
        """Create test data"""
        self.student = Student.objects.create(
            student_id=1, first_name='John', last_name='Doe',
            email='john@test.com', gender='Male', year_id=1,
            branch_id=1, sec_id=1, roll_no=101, phone_no='9999999999',
            passcode='pass'
        )
        self.faculty = Faculty.objects.create(
            faculty_id=1, first_name='Prof', last_name='Smith',
            email='prof@test.com', passcode='pass', gender='Male',
            department='CSE', designation='Associate Professor',
            qualifications='Ph.D'
        )
    
    def test_assignment_creation(self):
        """Test creating an assignment"""
        assignment = Assignment.objects.create(
            student=self.student,
            faculty=self.faculty,
            year_id=1,
            branch_id=1,
            section_id=1,
            course_id='CS101'
        )
        self.assertEqual(assignment.status, 'not_submitted')
        self.assertFalse(assignment.is_submitted)
        self.assertFalse(assignment.is_graded)
    
    def test_assignment_submission(self):
        """Test submitting an assignment"""
        assignment = Assignment.objects.create(
            student=self.student,
            faculty=self.faculty,
            year_id=1,
            branch_id=1,
            section_id=1,
            course_id='CS101',
            submitted_at=timezone.now()
        )
        self.assertEqual(assignment.status, 'submitted')
    
    def test_assignment_grading(self):
        """Test grading an assignment"""
        assignment = Assignment.objects.create(
            student=self.student,
            faculty=self.faculty,
            year_id=1,
            branch_id=1,
            section_id=1,
            course_id='CS101',
            submitted_at=timezone.now(),
            marks_awarded=8,
            graded_at=timezone.now()
        )
        self.assertEqual(assignment.status, 'graded')
        self.assertTrue(assignment.is_graded)
