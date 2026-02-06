from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from users.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get notifications for the logged-in user"""
    user = request.user
    
    # Get all broadcast notifications
    broadcast_notifs = Notification.objects.filter(
        year_id=0, branch_id=0, section_id=0, student_id=0
    )
    
    # Get role-specific notifications
    if user.role == 'student':
        from students.models import Student
        try:
            student = Student.objects.get(student_id=user.user_id)
            role_notifs = Notification.objects.filter(
                year_id=student.year_id,
                branch_id=student.branch_id,
                section_id=student.sec_id,
                student_id=student.student_id
            )
        except Student.DoesNotExist:
            role_notifs = Notification.objects.none()
    else:
        role_notifs = Notification.objects.none()
    
    notifications = broadcast_notifs | role_notifs
    data = [{
        'id': n.id,
        'title': n.title,
        'description': n.description,
        'type': n.notification_type,
        'due_date': n.due_date,
        'priority': n.priority,
    } for n in notifications.order_by('-created_at')]
    
    return Response(data, status=status.HTTP_200_OK)
