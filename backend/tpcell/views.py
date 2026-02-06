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
    try:
        emp = TPCellEmployee.objects.get(emp_id=request.user.user_id)
        data = {
            'emp_id': emp.emp_id,
            'first_name': emp.first_name,
            'last_name': emp.last_name,
            'email': emp.email,
            'designation': emp.designation,
            'gender': emp.gender,
        }
        return Response(data, status=status.HTTP_200_OK)
    except TPCellEmployee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tpcell_stats(request):
    """Get TP Cell dashboard statistics"""
    try:
        total_students = Student.objects.count()
        students_with_backlogs = Student.objects.filter(studentbacklog__isnull=False).distinct().count()
        eligible_students = total_students - students_with_backlogs
        
        # Calculate average CGPA from exam data if available
        from students.models import StudentExamData
        from django.db.models import Avg
        avg_cgpa_data = StudentExamData.objects.aggregate(avg_cgpa=Avg('cgpa'))
        avg_cgpa = avg_cgpa_data['avg_cgpa'] or 0
        
        data = {
            'total_students': total_students,
            'students_with_backlogs': students_with_backlogs,
            'eligible_students': eligible_students,
            'avg_cgpa': float(avg_cgpa),
        }
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
