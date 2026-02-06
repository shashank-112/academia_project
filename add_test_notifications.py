import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from notifications.models import Notification
from datetime import datetime, timedelta

# Clear existing notifications
Notification.objects.all().delete()

# Sample academic notifications
academic_notifs = [
    {
        'title': 'Mid Exam Schedule Released',
        'description': 'Mid examinations for this semester will be held from Feb 17 - Feb 28, 2026. Please check the detailed schedule in the Academic section.',
        'notification_type': 'Academic',
        'due_date': datetime.now().date() + timedelta(days=10),
        'priority': 'High',
        'year_id': 0,
        'branch_id': 0,
        'section_id': 0,
        'student_id': 0,
    },
    {
        'title': 'Assignment Submission Extended',
        'description': 'The deadline for DSA assignments has been extended to Feb 15, 2026. Submit through the course portal.',
        'notification_type': 'Academic',
        'due_date': datetime.now().date() + timedelta(days=9),
        'priority': 'Medium',
        'year_id': 0,
        'branch_id': 0,
        'section_id': 0,
        'student_id': 0,
    },
    {
        'title': 'Practical Exam for CS Lab',
        'description': 'CS Lab practicals will commence from Feb 20. Groups have been assigned. Check the notice board for your slot.',
        'notification_type': 'Academic',
        'due_date': datetime.now().date() + timedelta(days=14),
        'priority': 'High',
        'year_id': 0,
        'branch_id': 0,
        'section_id': 0,
        'student_id': 0,
    },
]

# Sample fee notifications
fee_notifs = [
    {
        'title': 'Semester Fees Due',
        'description': 'Second semester fees are now due. Please pay through the online portal or visit the fee office. Late payment will incur additional charges.',
        'notification_type': 'Fee',
        'due_date': datetime.now().date() + timedelta(days=5),
        'priority': 'High',
        'year_id': 0,
        'branch_id': 0,
        'section_id': 0,
        'student_id': 0,
    },
    {
        'title': 'Fee Payment Reminder',
        'description': 'This is a reminder that your pending fees are due by Feb 15, 2026. Payment can be made online or at the cashier counter.',
        'notification_type': 'Fee',
        'due_date': datetime.now().date() + timedelta(days=8),
        'priority': 'Medium',
        'year_id': 0,
        'branch_id': 0,
        'section_id': 0,
        'student_id': 0,
    },
]

# Sample general notifications
general_notifs = [
    {
        'title': 'College Foundation Day Celebration',
        'description': 'Join us for the college foundation day celebration on Feb 22, 2026. Various cultural and sports events will be organized. All students are invited to participate.',
        'notification_type': 'General',
        'due_date': datetime.now().date() + timedelta(days=16),
        'priority': 'Low',
        'year_id': 0,
        'branch_id': 0,
        'section_id': 0,
        'student_id': 0,
    },
    {
        'title': 'Library Renovation Notice',
        'description': 'The library will be closed for renovation from Feb 25 - Mar 10. Please plan accordingly and complete your book returns by Feb 24.',
        'notification_type': 'General',
        'due_date': datetime.now().date() + timedelta(days=19),
        'priority': 'Medium',
        'year_id': 0,
        'branch_id': 0,
        'section_id': 0,
        'student_id': 0,
    },
    {
        'title': 'New Campus WiFi Credentials',
        'description': 'New WiFi network "Campus-Pro" has been activated. Use your college ID and password to connect. Old network will be discontinued after March 5.',
        'notification_type': 'General',
        'due_date': datetime.now().date() + timedelta(days=27),
        'priority': 'Low',
        'year_id': 0,
        'branch_id': 0,
        'section_id': 0,
        'student_id': 0,
    },
]

# Create all notifications
all_notifs = academic_notifs + fee_notifs + general_notifs

for notif_data in all_notifs:
    Notification.objects.create(**notif_data)

print(f"✅ Successfully created {len(all_notifs)} test notifications!")
print(f"   - Academic: {len(academic_notifs)}")
print(f"   - Fee: {len(fee_notifs)}")
print(f"   - General: {len(general_notifs)}")
