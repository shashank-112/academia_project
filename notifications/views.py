from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from users.models import User
import logging

logger = logging.getLogger(__name__)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def get_notifications(request):
    """Get or create notifications"""
    
    # Log request details for debugging
    logger.info(f"📥 {request.method} request to /notifications/")
    logger.info(f"  Authorization header: {request.headers.get('Authorization', 'MISSING')}")
    logger.info(f"  User: {request.user} | Authenticated: {request.user.is_authenticated}")
    
    # Check authentication manually
    if not request.user or not request.user.is_authenticated:
        logger.warning(f"📛 Unauthenticated {request.method} request to /notifications/")
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.method == 'GET':
        # Get notifications for the logged-in user or public notifications
        notifications = Notification.objects.filter(
            year_id=0, branch_id=0, section_id=0, student_id=0
        )
        
        # If user is authenticated and is a student, also include role-specific notifications
        if request.user.is_authenticated:
            user = request.user
            if user.role == 'student':
                from students.models import Student
                try:
                    student = Student.objects.get(email=user.email)
                    role_notifs = Notification.objects.filter(
                        year_id=student.year_id,
                        branch_id=student.branch_id,
                        section_id=student.sec_id,
                        student_id=0  # Send to all in this class
                    )
                    notifications = notifications | role_notifs
                except Student.DoesNotExist:
                    pass
        
        data = [{
            'id': n.id,
            'title': n.title,
            'description': n.description,
            'notification_type': n.notification_type.lower(),
            'type': n.notification_type,
            'due_date': n.due_date,
            'priority': n.priority,
            'created_at': n.created_at.isoformat(),
        } for n in notifications.order_by('-created_at')]
        
        return Response(data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Faculty creates notification with class targeting
        user = request.user
        # Allow faculty, management and tp cell users to create notifications
        if user.role not in ('faculty', 'management', 'tpcell'):
            return Response({'error': 'Only faculty/management/tpcell can create notifications'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            title = request.data.get('title', '').strip()
            description = request.data.get('description', '').strip()
            notif_type = request.data.get('type', 'General').strip()
            priority = request.data.get('priority', 'Medium').strip()
            due_date = request.data.get('dueDate', '')
            targets = request.data.get('targets', [])
            
            if not title or not description:
                return Response({'error': 'Title and description are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not due_date:
                return Response({'error': 'Due date is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # If no specific classes selected, broadcast to all students
            if not targets or len(targets) == 0:
                notif = Notification.objects.create(
                    title=title,
                    description=description,
                    notification_type=notif_type,
                    priority=priority,
                    due_date=due_date,
                    year_id=0,
                    branch_id=0,
                    section_id=0,
                    student_id=0
                )
                logger.info(f"Faculty {user.email} created broadcast notification: {notif.id}")
                return Response({'id': notif.id, 'message': 'Notification created successfully'}, status=status.HTTP_201_CREATED)
            
            # Create notification for each targeted class
            created_ids = []
            
            for target in targets:
                # Support two kinds of targets:
                # 1) class target: {year_id, branch_id, section_id}
                # 2) individual student: {student_id}
                student_id = target.get('student_id')
                year_id = target.get('year_id')
                branch_id = target.get('branch_id')
                section_id = target.get('section_id')

                if student_id:
                    # Create notification for a specific student
                    notif = Notification.objects.create(
                        title=title,
                        description=description,
                        notification_type=notif_type,
                        priority=priority,
                        due_date=due_date,
                        year_id=year_id or 0,
                        branch_id=branch_id or 0,
                        section_id=section_id or 0,
                        student_id=student_id
                    )
                    created_ids.append(notif.id)
                    logger.info(f"{user.email} created notification for student {student_id}: {notif.id}")
                elif year_id and branch_id and section_id:
                    # Create one notification per class
                    notif = Notification.objects.create(
                        title=title,
                        description=description,
                        notification_type=notif_type,
                        priority=priority,
                        due_date=due_date,
                        year_id=year_id,
                        branch_id=branch_id,
                        section_id=section_id,
                        student_id=0  # 0 means send to all in this class
                    )
                    created_ids.append(notif.id)
                    logger.info(f"{user.email} created notification for class {year_id}-{branch_id}-{section_id}: {notif.id}")
            
            if created_ids:
                return Response(
                    {'ids': created_ids, 'message': f'Notification created for {len(created_ids)} class(es)'},
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response({'error': 'No valid target classes provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
