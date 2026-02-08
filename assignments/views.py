from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Q, Case, When, IntegerField
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Assignment
from .serializers import (
    AssignmentListSerializer, AssignmentDetailSerializer, 
    AssignmentUploadSerializer, AssignmentGradeSerializer,
    StudentAssignmentCardSerializer, FacultyAssignmentOverviewSerializer
)
from students.models import Student
from faculty.models import Faculty, FacultyAssignment
from notifications.models import Notification


# ==================== STUDENT ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_assignments(request):
    """
    Get all assignments for a student
    Returns assignments for courses the student is taking
    """
    try:
        student = Student.objects.get(email=request.user.email)
        
        # Get all assignments for this student
        assignments = Assignment.objects.filter(student=student).order_by('-created_at')
        serializer = AssignmentListSerializer(assignments, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_assignment_cards(request):
    """
    Get assignment cards for student dashboard
    Returns all courses the student is enrolled in, with assignment status if submitted
    Does NOT auto-create empty assignment records
    """
    try:
        student = Student.objects.get(email=request.user.email)
        
        # Get all courses this student should submit assignments for
        # (based on faculty course assignments for their year/branch/section)
        faculty_courses = FacultyAssignment.objects.filter(
            year_id=student.year_id,
            branch_id=student.branch_id,
            section_id=student.sec_id
        ).select_related('faculty').distinct('course_id')
        
        cards_data = []
        for faculty_course in faculty_courses:
            # Check if assignment record exists; if not, create a placeholder card without DB record
            assignment = Assignment.objects.filter(
                student=student,
                faculty=faculty_course.faculty,
                course_id=faculty_course.course_id,
            ).first()
            
            if assignment:
                # Return existing assignment
                serializer = StudentAssignmentCardSerializer(assignment)
                card = serializer.data
            else:
                # Return placeholder card for course without creating DB record
                card = {
                    'assignment_id': None,
                    'course_id': faculty_course.course_id,
                    'faculty_name': f"{faculty_course.faculty.first_name} {faculty_course.faculty.last_name}",
                    'faculty_email': faculty_course.faculty.email,
                    'status': 'not_submitted',
                    'is_submitted': False,
                    'is_graded': False,
                    'submitted_at': None,
                    'marks_awarded': None,
                    'graded_at': None,
                    'faculty_id': faculty_course.faculty.faculty_id,
                }
            
            cards_data.append(card)
        
        return Response(cards_data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_assignment_detail(request, assignment_id):
    """
    Get detailed information about a specific assignment
    """
    try:
        student = Student.objects.get(email=request.user.email)
        assignment = get_object_or_404(
            Assignment, 
            assignment_id=assignment_id, 
            student=student
        )
        
        serializer = AssignmentDetailSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def student_create_assignment(request, faculty_id, course_id):
    """
    Create a new assignment record for a student to submit to
    Used when student clicks upload for a course they haven't submitted to yet
    """
    try:
        student = Student.objects.get(email=request.user.email)
        faculty = Faculty.objects.get(faculty_id=faculty_id)
        
        # Verify this is a valid course for this student
        faculty_course = FacultyAssignment.objects.get(
            faculty=faculty,
            course_id=course_id,
            year_id=student.year_id,
            branch_id=student.branch_id,
            section_id=student.sec_id
        )
        
        # Create or get the assignment
        assignment, created = Assignment.objects.get_or_create(
            student=student,
            faculty=faculty,
            course_id=course_id,
            defaults={
                'year_id': student.year_id,
                'branch_id': student.branch_id,
                'section_id': student.sec_id,
            }
        )
        
        if created:
            message = 'Assignment record created'
        else:
            message = 'Assignment already exists'
        
        serializer = StudentAssignmentCardSerializer(assignment)
        return Response(
            {
                'message': message,
                'data': serializer.data
            }, 
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Faculty.DoesNotExist:
        return Response(
            {'error': 'Faculty not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except FacultyAssignment.DoesNotExist:
        return Response(
            {'error': 'This faculty has not assigned this course to your section'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def student_upload_assignment(request, assignment_id):
    """
    Upload or re-upload assignment PDF
    Creates assignment record if it doesn't exist yet
    """
    try:
        student = Student.objects.get(email=request.user.email)
        
        # Try to get existing assignment, or return error if it doesn't exist
        try:
            assignment = Assignment.objects.get(
                assignment_id=assignment_id,
                student=student
            )
        except Assignment.DoesNotExist:
            return Response(
                {'error': 'Assignment not found. Please ensure faculty has assigned this course.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AssignmentUploadSerializer(
            assignment, 
            data=request.FILES,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'message': 'Assignment uploaded successfully',
                    'data': serializer.data
                }, 
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_student_assignment(request, assignment_id):
    """
    Download assignment PDF
    """
    try:
        student = Student.objects.get(email=request.user.email)
        assignment = get_object_or_404(
            Assignment, 
            assignment_id=assignment_id, 
            student=student
        )
        
        if not assignment.assignment_pdf:
            return Response(
                {'error': 'No file uploaded'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'download_url': assignment.assignment_pdf.url,
            'file_name': assignment.file_name,
            'file_size': assignment.file_size
        }, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# ==================== FACULTY ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_assignments_overview(request):
    """
    Get assignment overview for faculty
    Returns statistics: total, pending grading, graded
    """
    try:
        faculty = Faculty.objects.get(email=request.user.email)
        
        assignments = Assignment.objects.filter(faculty=faculty)
        total = assignments.count()
        pending = assignments.filter(marks_awarded__isnull=True).count()
        graded = assignments.filter(marks_awarded__isnull=False).count()
        
        data = {
            'total_assignments': total,
            'pending_grading': pending,
            'graded': graded
        }
        
        return Response(data, status=status.HTTP_200_OK)
    except Faculty.DoesNotExist:
        return Response(
            {'error': 'Faculty not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_pending_assignments(request):
    """
    Get pending assignments for faculty (not graded yet)
    """
    try:
        faculty = Faculty.objects.get(email=request.user.email)
        
        assignments = Assignment.objects.filter(
            faculty=faculty,
            assignment_pdf__isnull=False,  # Has submission
            marks_awarded__isnull=True  # Not graded
        ).order_by('-submitted_at')
        
        serializer = AssignmentListSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Faculty.DoesNotExist:
        return Response(
            {'error': 'Faculty not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_graded_assignments(request):
    """
    Get graded assignments for faculty
    """
    try:
        faculty = Faculty.objects.get(email=request.user.email)
        
        assignments = Assignment.objects.filter(
            faculty=faculty,
            marks_awarded__isnull=False
        ).order_by('-graded_at')
        
        serializer = AssignmentListSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Faculty.DoesNotExist:
        return Response(
            {'error': 'Faculty not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def faculty_grade_assignment(request, assignment_id):
    """
    Grade an assignment with marks (0-10)
    Creates notification for student
    """
    try:
        faculty = Faculty.objects.get(email=request.user.email)
        assignment = get_object_or_404(
            Assignment, 
            assignment_id=assignment_id, 
            faculty=faculty
        )
        
        serializer = AssignmentGradeSerializer(
            assignment,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Create notification for student
            student = assignment.student
            Notification.objects.create(
                student_id=student.student_id,
                year_id=student.year_id,
                branch_id=student.branch_id,
                section_id=student.sec_id,
                notification_type='assignment_graded',
                title=f'Assignment Graded - {assignment.course_id}',
                description=f'Your assignment for {assignment.course_id} has been graded. Marks: {serializer.validated_data["marks_awarded"]}/10',
                due_date=timezone.now().date(),
                priority='Medium',
            )
            
            return Response({
                'message': 'Assignment graded successfully',
                'data': AssignmentDetailSerializer(assignment).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Faculty.DoesNotExist:
        return Response(
            {'error': 'Faculty not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_assignment_detail(request, assignment_id):
    """
    Get detailed information about assignment for faculty
    """
    try:
        faculty = Faculty.objects.get(faculty_id=request.user.user_id)
        assignment = get_object_or_404(
            Assignment, 
            assignment_id=assignment_id, 
            faculty=faculty
        )
        
        serializer = AssignmentDetailSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Faculty.DoesNotExist:
        return Response(
            {'error': 'Faculty not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_faculty_assignment(request, assignment_id):
    """
    Download assignment PDF for faculty
    """
    try:
        faculty = Faculty.objects.get(faculty_id=request.user.user_id)
        assignment = get_object_or_404(
            Assignment, 
            assignment_id=assignment_id, 
            faculty=faculty
        )
        
        if not assignment.assignment_pdf:
            return Response(
                {'error': 'No file submitted'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'download_url': assignment.assignment_pdf.url,
            'file_name': assignment.file_name,
            'file_size': assignment.file_size,
            'student_name': f"{assignment.student.first_name} {assignment.student.last_name}",
            'student_roll_no': assignment.student.roll_no
        }, status=status.HTTP_200_OK)
    except Faculty.DoesNotExist:
        return Response(
            {'error': 'Faculty not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
