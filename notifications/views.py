from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from users.models import User

@api_view(['GET'])
@permission_classes([AllowAny])
def get_notifications(request):
    """Get notifications for the logged-in user or public notifications"""
    
    # Get all broadcast notifications (visible to everyone)
    notifications = Notification.objects.filter(
        year_id=0, branch_id=0, section_id=0, student_id=0
    )
    
    # If user is authenticated, also include role-specific notifications
    if request.user.is_authenticated:
        user = request.user
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
                notifications = notifications | role_notifs
            except Student.DoesNotExist:
                pass
    
    data = [{
        'id': n.id,
        'title': n.title,
        'description': n.description,
        'notification_type': n.notification_type.lower(),  # Return as lowercase for filtering
        'type': n.notification_type,
        'due_date': n.due_date,
        'priority': n.priority,
        'created_at': n.created_at.isoformat(),
    } for n in notifications.order_by('-created_at')]
    
    return Response(data, status=status.HTTP_200_OK)
