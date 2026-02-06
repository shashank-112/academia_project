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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def management_profile(request):
    """Get management employee profile"""
    # Prefer email lookup first, fall back to user_id if necessary
    emp = None
    try:
        emp = ManagementEmployee.objects.get(email=request.user.email)
    except ManagementEmployee.DoesNotExist:
        uid = getattr(request.user, 'user_id', None)
        if uid:
            try:
                emp = ManagementEmployee.objects.get(emp_id=uid)
            except ManagementEmployee.DoesNotExist:
                emp = None

    if not emp:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

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
        
        if year:
            queryset = queryset.filter(year=year)
        if branch:
            queryset = queryset.filter(branch=branch)
        if section:
            queryset = queryset.filter(section=section)
        
        students = queryset[:100]  # Limit to 100
        data = [{
            'id': s.student_id,
            'name': f"{s.first_name} {s.last_name}",
            'email': s.email,
            'roll_no': s.roll_no,
            'phone': s.phone_no,
            'year': s.year,
            'branch': s.branch,
            'section': s.section,
        } for s in students]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        all_fees = StudentFee.objects.all()
        collected = sum([fee.paid_crt_fee for fee in all_fees])
        expected = sum([fee.fee_total for fee in all_fees])
        pending = expected - collected
        
        return Response({
            'expected_fee': expected,
            'collected_fee': collected,
            'pending_fee': pending
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_fee_details(request):
    """Get student fee details with optional filters"""
    try:
        queryset = StudentFee.objects.all()
        
        year = request.GET.get('year', '')
        branch = request.GET.get('branch', '')
        
        # Filter by student's year/branch if provided
        if year or branch:
            student_filter = {}
            if year:
                student_filter['year'] = year
            if branch:
                student_filter['branch'] = branch
            queryset = queryset.filter(student__in=Student.objects.filter(**student_filter))
        
        fees = queryset[:100]  # Limit to 100
        data = [{
            'id': f.student.student_id,
            'name': f"{f.student.first_name} {f.student.last_name}",
            'email': f.student.email,
            'roll_no': f.student.roll_no,
            'admission_mode': getattr(f, 'mode_of_admission', 'Regular'),
            'fee_total': f.fee_total,
            'paid_amount': f.paid_crt_fee,
            'remaining_amount': f.remaining_amount if hasattr(f, 'remaining_amount') else (f.fee_total - f.paid_crt_fee),
            'library_fine': f.library_fine if hasattr(f, 'library_fine') else 0,
            'equipment_fine': f.equipment_fine if hasattr(f, 'equipment_fine') else 0,
            'status': 'Paid' if f.paid_crt_fee >= f.fee_total else 'Pending'
        } for f in fees]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
