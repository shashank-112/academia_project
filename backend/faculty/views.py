from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Faculty, FacultyAssignment

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_profile(request):
    """Get faculty profile"""
    try:
        faculty = Faculty.objects.get(faculty_id=request.user.user_id)
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
        faculty = Faculty.objects.get(faculty_id=request.user.user_id)
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
