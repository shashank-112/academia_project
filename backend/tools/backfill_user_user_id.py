#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from users.models import User
from students.models import Student
from faculty.models import Faculty
from management.models import ManagementEmployee
from tpcell.models import TPCellEmployee

users = User.objects.filter(user_id__isnull=True)
print(f"Found {users.count()} users with null user_id")
updated = 0
for u in users:
    email = u.email
    try:
        if u.role == 'student':
            s = Student.objects.filter(email=email).first()
            if s:
                u.user_id = s.student_id
                u.save()
                updated += 1
                print(f"Set user_id for {email} -> student {s.student_id}")
                continue
        elif u.role == 'faculty':
            f = Faculty.objects.filter(email=email).first()
            if f:
                u.user_id = f.faculty_id
                u.save()
                updated += 1
                print(f"Set user_id for {email} -> faculty {f.faculty_id}")
                continue
        elif u.role == 'management':
            m = ManagementEmployee.objects.filter(email=email).first()
            if m:
                u.user_id = m.emp_id
                u.save()
                updated += 1
                print(f"Set user_id for {email} -> management {m.emp_id}")
                continue
        elif u.role == 'tpcell':
            t = TPCellEmployee.objects.filter(email=email).first()
            if t:
                u.user_id = t.emp_id
                u.save()
                updated += 1
                print(f"Set user_id for {email} -> tpcell {t.emp_id}")
                continue
    except Exception as e:
        print(f"Error processing {email}: {e}")

print(f"Updated {updated} users")
