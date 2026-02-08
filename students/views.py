from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Student, StudentAcademic, StudentBacklog, StudentExamData

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_profile(request):
    """Get student profile"""
    try:
        student = Student.objects.get(email=request.user.email)
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
        student = Student.objects.get(email=request.user.email)
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
        student = Student.objects.get(email=request.user.email)
        backlogs = StudentBacklog.objects.filter(student=student)
        data = [{
            'semester_id': b.semester_id,
            'course_id': b.course_id
        } for b in backlogs]
        return Response(data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_exam_data(request):
    """Get student mid exam marks, quiz marks, and assignment marks"""
    try:
        student = Student.objects.get(email=request.user.email)
        exam_data = StudentExamData.objects.filter(student=student).order_by('semester_id', '-mid_id', 'course_id')
        
        data = [{
            'semester_id': e.semester_id,
            'mid_id': e.mid_id,
            'course_id': e.course_id,
            'mid_marks': e.mid_marks,
            'quiz_marks': e.quiz_marks,
            'assignment_marks': e.assignment_marks,
            'total_marks': e.mid_marks + e.quiz_marks + e.assignment_marks
        } for e in exam_data]
        
        return Response(data, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

