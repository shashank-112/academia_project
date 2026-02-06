from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import TPCellEmployee

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
    }
    return Response(data, status=status.HTTP_200_OK)
