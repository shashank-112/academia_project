from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ManagementEmployee
from students.models import Student
from students.models import StudentFee
from faculty.models import Faculty
from notifications.models import Notification
from django.db.models import Sum
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_profile(request):
    """Get management employee profile"""
    emp = None
    try:
        emp = ManagementEmployee.objects.get(email=request.user.email)
        logger.info(f"✓ Management Profile: Found employee by email: {request.user.email}")
    except ManagementEmployee.DoesNotExist:
        logger.warning(f"⚠ Management Profile: No employee with email '{request.user.email}'")
        uid = getattr(request.user, 'user_id', None)
        if uid:
            try:
                emp = ManagementEmployee.objects.get(emp_id=uid)
                logger.info(f"✓ Management Profile: Found employee by emp_id: {uid}")
            except ManagementEmployee.DoesNotExist:
                logger.error(f"✗ Management Profile: No employee with emp_id {uid}")

    if not emp:
        error_msg = f"Employee not found for user {request.user.email} (user_id: {getattr(request.user, 'user_id', 'None')})"
        logger.error(f"✗ {error_msg}")
        return Response({'error': error_msg}, status=status.HTTP_404_NOT_FOUND)

    data = {
        'emp_id': emp.emp_id,
        'first_name': emp.first_name,
        'last_name': emp.last_name,
        'email': emp.email,
        'designation': emp.designation,
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_count(request):
    try:
        total = Student.objects.count()
        return Response({'total': total}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_faculty_count(request):
    try:
        total = Faculty.objects.count()
        return Response({'total': total}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_fee_stats(request):
    try:
        collected = StudentFee.objects.aggregate(total=Sum('paid_crt_fee'))['total'] or 0
        total_due = StudentFee.objects.aggregate(total=Sum('fee_total'))['total'] or 0
        pending = total_due - collected
        return Response({'collected': collected, 'pending': pending}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_notifications(request):
    try:
        limit = int(request.GET.get('limit', 5))
        notifs = Notification.objects.order_by('-created_at')[:limit]
        data = [{
            'id': n.id,
            'title': n.title,
            'message': n.description if hasattr(n, 'description') else getattr(n, 'message', ''),
            'type': getattr(n, 'notification_type', '')
        } for n in notifs]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_students(request):
    """Get all students with optional filters"""
    try:
        queryset = Student.objects.all()
        
        year = request.GET.get('year', '')
        branch = request.GET.get('branch', '')
        section = request.GET.get('section', '')
        
        filters_applied = []
        
        # Map filter values to correct field names
        if year:
            try:
                year_id = int(year) if year.isdigit() else year
                queryset = queryset.filter(year_id=year_id)
                filters_applied.append(f"year_id={year_id}")
            except ValueError as e:
                logger.warning(f"Invalid year filter: {year}. Error: {str(e)}")
                return Response({'error': f'Invalid year filter: {year}'}, status=status.HTTP_400_BAD_REQUEST)
                
        if branch:
            try:
                branch_id = int(branch) if branch.isdigit() else branch
                queryset = queryset.filter(branch_id=branch_id)
                filters_applied.append(f"branch_id={branch_id}")
            except ValueError as e:
                logger.warning(f"Invalid branch filter: {branch}. Error: {str(e)}")
                return Response({'error': f'Invalid branch filter: {branch}'}, status=status.HTTP_400_BAD_REQUEST)
                
        if section:
            try:
                sec_id = int(section) if section.isdigit() else section
                queryset = queryset.filter(sec_id=sec_id)
                filters_applied.append(f"sec_id={sec_id}")
            except ValueError as e:
                logger.warning(f"Invalid section filter: {section}. Error: {str(e)}")
                return Response({'error': f'Invalid section filter: {section}'}, status=status.HTTP_400_BAD_REQUEST)
        
        students = queryset[:100]  # Limit to 100
        student_count = len(students)
        logger.info(f"✓ Retrieved {student_count} students with filters: {', '.join(filters_applied) if filters_applied else 'none'}")
        
        data = [{
            'id': int(s.student_id),
            'name': f"{s.first_name} {s.last_name}",
            'email': s.email,
            'roll_no': int(s.roll_no),
            'phone': s.phone_no,
            'year': int(s.year_id),
            'branch': int(s.branch_id),
            'section': int(s.sec_id),
        } for s in students]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"✗ Error fetching students: {str(e)}", exc_info=True)
        return Response({'error': f'Error fetching students: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_faculty(request):
    """Get all faculty"""
    try:
        faculty_list = Faculty.objects.all()[:100]
        data = [{
            'id': f.faculty_id,
            'name': f"{f.first_name} {f.last_name}",
            'email': f.email,
            'department': f.department,
            'designation': f.designation,
            'qualifications': [f.qualifications] if f.qualifications else [],
        } for f in faculty_list]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_fee_summary(request):
    """Get fee summary (expected, collected, pending)"""
    try:
        logger.info("Fetching fee summary...")
        all_fees = StudentFee.objects.all()
        fee_count = all_fees.count()
        logger.info(f"Found {fee_count} fee records in database")
        
        collected = sum([fee.paid_crt_fee if fee.paid_crt_fee is not None else 0 for fee in all_fees])
        expected = sum([fee.fee_total if fee.fee_total is not None else 0 for fee in all_fees])
        pending = expected - collected
        
        logger.info(f"✓ Fee summary: Expected={expected}, Collected={collected}, Pending={pending}")
        
        return Response({
            'expectedFee': int(expected),
            'collectedFee': int(collected),
            'pendingFee': int(pending)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"✗ Error fetching fee summary: {str(e)}", exc_info=True)
        return Response({'error': f'Error fetching fee summary: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_fee_details(request):
    """Get student fee details with optional filters"""
    try:
        logger.info("Fetching student fee details...")
        queryset = StudentFee.objects.all()
        
        year = request.GET.get('year', '')
        branch = request.GET.get('branch', '')
        filters_applied = []
        
        # Filter by student's year/branch if provided
        if year or branch:
            student_filter = {}
            if year:
                try:
                    year_id = int(year) if year.isdigit() else year
                    student_filter['year_id'] = year_id
                    filters_applied.append(f"year_id={year_id}")
                except ValueError as e:
                    logger.warning(f"Invalid year filter: {year}")
                    return Response({'error': f'Invalid year filter: {year}'}, status=status.HTTP_400_BAD_REQUEST)
                    
            if branch:
                try:
                    branch_id = int(branch) if branch.isdigit() else branch
                    student_filter['branch_id'] = branch_id
                    filters_applied.append(f"branch_id={branch_id}")
                except ValueError as e:
                    logger.warning(f"Invalid branch filter: {branch}")
                    return Response({'error': f'Invalid branch filter: {branch}'}, status=status.HTTP_400_BAD_REQUEST)
                    
            if student_filter:
                students = Student.objects.filter(**student_filter)
                logger.info(f"Found {students.count()} students with filters: {', '.join(filters_applied)}")
                queryset = queryset.filter(student__in=students)
        
        fees = queryset[:100]  # Limit to 100
        fee_count = len(fees)
        logger.info(f"✓ Retrieved {fee_count} fee records with filters: {', '.join(filters_applied) if filters_applied else 'none'}")
        
        data = [{
            'id': int(f.student.student_id),
            'name': f"{f.student.first_name} {f.student.last_name}",
            'email': f.student.email,
            'roll_no': int(f.student.roll_no),
            'admissionMode': f.mode_of_admission,
            'feeTotal': int(f.fee_total) if f.fee_total is not None else 0,
            'paidAmount': int(f.paid_crt_fee) if f.paid_crt_fee is not None else 0,
            'remainingAmount': int(f.remaining_amount) if f.remaining_amount is not None else (int(f.fee_total - f.paid_crt_fee) if f.fee_total and f.paid_crt_fee else 0),
            'libraryFine': int(f.library_fine) if f.library_fine is not None else 0,
            'equipmentFine': int(f.equipment_fine) if f.equipment_fine is not None else 0,
            'status': 'Paid' if (f.paid_crt_fee and f.fee_total and f.paid_crt_fee >= f.fee_total) else 'Pending'
        } for f in fees]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"✗ Error fetching student fee details: {str(e)}", exc_info=True)
        return Response({'error': f'Error fetching student fee details: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
