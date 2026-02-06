from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import TPCellEmployee
from students.models import Student, StudentBacklog
from notifications.models import Notification

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tpcell_profile(request):
    """Get TP Cell employee profile"""
    # Prefer email lookup (unique) and fall back to user_id if available
    emp = None
    try:
        emp = TPCellEmployee.objects.get(email=request.user.email)
    except TPCellEmployee.DoesNotExist:
        uid = getattr(request.user, 'user_id', None)
        if uid:
            try:
                emp = TPCellEmployee.objects.get(emp_id=uid)
            except TPCellEmployee.DoesNotExist:
                emp = None

    if not emp:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

    data = {
        'emp_id': emp.emp_id,
        'first_name': emp.first_name,
        'last_name': emp.last_name,
        'email': emp.email,
        'designation': emp.designation,
        'gender': emp.gender,
    }
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tpcell_stats(request):
    """Get TP Cell dashboard statistics"""
    try:
        total_students = Student.objects.count()
        # Count students that have backlogs (use StudentBacklog model / related_name 'backlogs')
        students_with_backlogs = StudentBacklog.objects.values('student_id').distinct().count()
        eligible_students = total_students - students_with_backlogs

        # Calculate average CGPA from exam data (safe calculation using available marks)
        from students.models import StudentExamData
        avg_cgpa = 0.0
        exam_data = StudentExamData.objects.all()
        if exam_data.exists():
            all_marks = exam_data.values_list('mid_marks', 'quiz_marks', 'assignment_marks')
            if all_marks:
                total_marks = sum([m[0] + m[1] + m[2] for m in all_marks])
                avg_cgpa = (total_marks / (len(all_marks) * 30)) * 10
        
        data = {
            'total_students': total_students,
            'students_with_backlogs': students_with_backlogs,
            'eligible_students': eligible_students,
            'avg_cgpa': float(avg_cgpa),
        }
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
