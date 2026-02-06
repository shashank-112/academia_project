import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from notifications.models import Notification

count = Notification.objects.count()
print(f"\n✅ Total notifications in database: {count}\n")

notifs = Notification.objects.all()[:10]
for n in notifs:
    print(f"  ✓ {n.title} ({n.notification_type}) - Priority: {n.priority}")

print(f"\n✅ Database check complete!")
