from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import TPCellEmployee

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
        }
        return Response(data, status=status.HTTP_200_OK)
    except TPCellEmployee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
