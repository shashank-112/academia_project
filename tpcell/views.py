from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import TPCellEmployee
from students.models import Student, StudentBacklog, StudentExamData
from django.db.models import Q, Avg, Prefetch
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tpcell_profile(request):
    """Get TP Cell employee profile"""
    emp = None
    
    # Try email lookup first
    try:
        emp = TPCellEmployee.objects.get(email=request.user.email)
        logger.info(f"✓ TP Cell Profile: Found employee by email: {request.user.email}")
    except TPCellEmployee.DoesNotExist:
        logger.warning(f"⚠ TP Cell Profile: No employee with email '{request.user.email}'")
        
        # Fallback: Try user_id lookup (emp_id)
        user_id = getattr(request.user, 'user_id', None)
        if user_id:
            try:
                emp = TPCellEmployee.objects.get(emp_id=user_id)
                logger.info(f"✓ TP Cell Profile: Found employee by emp_id: {user_id}")
            except TPCellEmployee.DoesNotExist:
                logger.error(f"✗ TP Cell Profile: No employee with emp_id {user_id}")
    
    if not emp:
        error_msg = f"Employee not found for user {request.user.email} (user_id: {getattr(request.user, 'user_id', 'None')})"
        logger.error(f"✗ {error_msg}")
        return Response({'error': error_msg}, status=status.HTTP_404_NOT_FOUND)
    
    data = {
        'emp_id': emp.emp_id,
        'first_name': emp.first_name,
        'last_name': emp.last_name,
        'email': emp.email,
        'gender': emp.gender,
        'designation': emp.designation,
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tpcell_get_students(request):
    """Get all students with optional filtering by year, branch, and section"""
    try:
        # Get filter parameters
        year = request.query_params.get('year')
        branch = request.query_params.get('branch')
        section = request.query_params.get('section')
        
        # Start with all students
        students_qs = Student.objects.all()
        
        # Apply filters if provided
        if year and year != 'all':
            students_qs = students_qs.filter(year_id=int(year))
        
        if branch and branch != 'all':
            students_qs = students_qs.filter(branch_id=int(branch))
        
        if section and section != 'all':
            students_qs = students_qs.filter(sec_id=int(section))
        
        # Get backlogs count and CGPA for each student
        students_data = []
        for student in students_qs:
            backlogs_count = StudentBacklog.objects.filter(student_id=student.student_id).count()
            
            # Calculate CGPA from exam data if available
            exam_records = StudentExamData.objects.filter(student_id=student.student_id)
            cgpa = 0.0
            if exam_records.exists():
                total_marks = 0
                total_records = 0
                for exam in exam_records:
                    total_marks += exam.mid_marks + exam.quiz_marks + exam.assignment_marks
                    total_records += 1
                # Convert to 10-point scale (max total = 30 per exam)
                if total_records > 0:
                    cgpa = round((total_marks / (total_records * 30)) * 10, 2)
            
            students_data.append({
                'id': student.student_id,
                'name': f"{student.first_name} {student.last_name}",
                'email': student.email,
                'roll_no': student.roll_no,
                'year_id': student.year_id,
                'branch_id': student.branch_id,
                'section_id': student.sec_id,
                'phone_no': student.phone_no or '',
                'cgpa': cgpa,
                'backlogs': backlogs_count,
            })
        
        logger.info(f"✓ TP Cell: Retrieved {len(students_data)} students with filters (year={year}, branch={branch}, section={section})")
        return Response(students_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"✗ Error retrieving TP Cell students: {str(e)}")
        return Response({'error': f'Error retrieving students: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tpcell_stats(request):
    """Get TP Cell placement and student statistics"""
    emp = None
    
    # Try email lookup first
    try:
        emp = TPCellEmployee.objects.get(email=request.user.email)
        logger.info(f"✓ TP Cell Stats: Found employee by email: {request.user.email}")
    except TPCellEmployee.DoesNotExist:
        logger.warning(f"⚠ TP Cell Stats: No employee with email '{request.user.email}'")
        
        # Fallback: Try user_id lookup (emp_id)
        user_id = getattr(request.user, 'user_id', None)
        if user_id:
            try:
                emp = TPCellEmployee.objects.get(emp_id=user_id)
                logger.info(f"✓ TP Cell Stats: Found employee by emp_id: {user_id}")
            except TPCellEmployee.DoesNotExist:
                logger.error(f"✗ TP Cell Stats: No employee with emp_id {user_id}")
    
    if not emp:
        error_msg = f"Employee not found for user {request.user.email} (user_id: {getattr(request.user, 'user_id', 'None')})"
        logger.error(f"✗ {error_msg}")
        return Response({'error': error_msg}, status=status.HTTP_404_NOT_FOUND)
        
    try:
        # Calculate statistics
        total_students = Student.objects.count()
        
        # Students with backlogs
        students_with_backlogs = StudentBacklog.objects.values('student_id').distinct().count()
        
        # Calculate average CGPA from exam data
        exam_data = StudentExamData.objects.all()
        avg_cgpa = 0.0
        
        if exam_data.exists():
            # Calculate average score across all students and exams
            all_marks = exam_data.values_list('mid_marks', 'quiz_marks', 'assignment_marks')
            if all_marks:
                total_marks = sum([m[0] + m[1] + m[2] for m in all_marks])
                avg_cgpa = (total_marks / (len(all_marks) * 30)) * 10  # Convert to 10-point scale
        
        # Eligible students = total - students with backlogs
        eligible_students = total_students - students_with_backlogs
        if eligible_students < 0:
            eligible_students = 0
        
        data = {
            'total_students': total_students,
            'students_with_backlogs': students_with_backlogs,
            'eligible_students': eligible_students,
            'avg_cgpa': round(avg_cgpa, 2),
        }
        
        logger.info(f"✓ TP Cell Stats calculated successfully for {emp.emp_id}")
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"✗ Error calculating TP Cell stats: {str(e)}")
        return Response({'error': f'Error calculating statistics: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
