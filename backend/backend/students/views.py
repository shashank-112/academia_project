from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Student, StudentAcademic, StudentBacklog

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_profile(request):
    """Get student profile"""
    try:
        student = Student.objects.get(student_id=request.user.user_id)
        data = {
            'student_id': student.student_id,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'email': student.email,
            'phone_no': student.phone_no,
            'roll_no': student.roll_no,
            'year_id': student.year_id,
            'branch_id': student.branch_id,
            'section_id': student.sec_id,
        }
        return Response(data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_academics(request):
    """Get student academic records"""
    try:
        student = Student.objects.get(student_id=request.user.user_id)
        academics = StudentAcademic.objects.filter(student=student)
        data = [{
            'semester_id': a.semester_id,
            'course_code': a.course_code,
            'marks': a.marks,
            'attendance': a.attendance
        } for a in academics]
        return Response(data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_backlogs(request):
    """Get student backlogs"""
    try:
        student = Student.objects.get(student_id=request.user.user_id)
        backlogs = StudentBacklog.objects.filter(student=student)
        data = [{
            'semester_id': b.semester_id,
            'course_id': b.course_id
        } for b in backlogs]
        return Response(data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
