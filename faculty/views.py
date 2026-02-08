from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Faculty, FacultyAssignment
from students.models import Student, StudentBacklog, StudentExamData
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_profile(request):
    """Get faculty profile"""
    try:
        faculty = Faculty.objects.get(email=request.user.email)
        data = {
            'faculty_id': faculty.faculty_id,
            'first_name': faculty.first_name,
            'last_name': faculty.last_name,
            'email': faculty.email,
            'department': faculty.department,
            'designation': faculty.designation,
            'qualifications': faculty.qualifications,
        }
        return Response(data, status=status.HTTP_200_OK)
    except Faculty.DoesNotExist:
        return Response({'error': 'Faculty not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_assignments(request):
    """Get faculty course assignments"""
    try:
        faculty = Faculty.objects.get(email=request.user.email)
        assignments = FacultyAssignment.objects.filter(faculty=faculty)
        data = [{
            'year_id': a.year_id,
            'branch_id': a.branch_id,
            'section_id': a.section_id,
            'course_id': a.course_id
        } for a in assignments]
        return Response(data, status=status.HTTP_200_OK)
    except Faculty.DoesNotExist:
        return Response({'error': 'Faculty not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_students(request):
    """Get students that faculty is teaching (from their assignments)"""
    try:
        logger.info(f"✓ Fetching students for faculty with email: {request.user.email}")
        faculty = Faculty.objects.get(email=request.user.email)
        
        # Get faculty's assignments
        assignments = FacultyAssignment.objects.filter(faculty=faculty).distinct()
        
        # Build query filters from optional request parameters
        filters = {}
        if request.GET.get('year'):
            try:
                filters['year_id'] = int(request.GET.get('year'))
            except ValueError:
                pass
        if request.GET.get('branch'):
            try:
                filters['branch_id'] = int(request.GET.get('branch'))
            except ValueError:
                pass
        if request.GET.get('section'):
            try:
                filters['sec_id'] = int(request.GET.get('section'))
            except ValueError:
                pass
        
        # Get unique year, branch, section combinations from assignments
        if assignments.exists():
            query = Student.objects.filter(
                year_id__in=assignments.values_list('year_id', flat=True),
                branch_id__in=assignments.values_list('branch_id', flat=True),
                sec_id__in=assignments.values_list('section_id', flat=True)
            )
        else:
            # Fallback: return all students if faculty has no assignments (for testing)
            logger.warning(f"⚠ Faculty {faculty.faculty_id} has no assignments, returning all students")
            query = Student.objects.all()
        
        # Apply additional filters if provided
        if filters:
            query = query.filter(**filters)
        
        students_list = []
        for student in query.order_by('student_id'):
            # Get backlogs count
            backlogs = StudentBacklog.objects.filter(student=student).count()
            
            # Calculate CGPA from exam data
            exam_data = StudentExamData.objects.filter(student=student)
            cgpa = 0.0
            if exam_data.exists():
                total_marks = sum([e.mid_marks + e.quiz_marks + e.assignment_marks for e in exam_data])
                cgpa = (total_marks / (exam_data.count() * 30)) * 10 if exam_data.count() > 0 else 0.0
                cgpa = round(cgpa, 2)
            
            students_list.append({
                'id': student.student_id,
                'name': f"{student.first_name} {student.last_name}",
                'email': student.email,
                'roll_no': student.roll_no,
                'year_id': student.year_id,
                'branch_id': student.branch_id,
                'section_id': student.sec_id,
                'phone_no': student.phone_no,
                'cgpa': cgpa,
                'backlogs': backlogs,
            })
        
        logger.info(f"✓ Retrieved {len(students_list)} students for faculty {faculty.faculty_id}")
        return Response(students_list, status=status.HTTP_200_OK)
    except Faculty.DoesNotExist:
        logger.error(f"✗ Faculty not found for email: {request.user.email}")
        return Response({'error': 'Faculty not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"✗ Error fetching faculty students: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
