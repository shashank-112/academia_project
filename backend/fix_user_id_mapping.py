#!/usr/bin/env python
"""
Fix user_id linking for all users
Maps user_id to emp_id (for tpcell/faculty/management) or student_id (for students)
"""
import os
import django
import pandas as pd
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.contrib.auth.models import User
from students.models import Student
from faculty.models import Faculty
from tpcell.models import TPCellEmployee
from management.models import ManagementEmployee

print("="*80)
print("FIXING USER_ID LINKAGE FOR ALL USERS")
print("="*80)

# Fix TP Cell users
print("\n[1/4] Fixing TP Cell user_id mapping...")
tpcell_employees = TPCellEmployee.objects.all()
updated_count = 0
for emp in tpcell_employees:
    try:
        user = User.objects.get(email=emp.email, role='tpcell')
        if not user.user_id:
            user.user_id = emp.emp_id
            user.save()
            updated_count += 1
    except User.DoesNotExist:
        # If user doesn't exist, create one
        try:
            from django.contrib.auth.hashers import make_password
            user = User.objects.create(
                email=emp.email,
                username=emp.email.split('@')[0][:30],
                first_name=emp.first_name[:30],
                last_name=emp.last_name[:30],
                role='tpcell',
                user_id=emp.emp_id,
                password=make_password(emp.passcode)
            )
            updated_count += 1
            print(f"  Created user for TP Cell employee: {emp.email}")
        except Exception as e:
            print(f"  Error creating user for {emp.email}: {e}")

print(f"✓ Updated {updated_count} TP Cell users")

# Fix Faculty users
print("\n[2/4] Fixing Faculty user_id mapping...")
faculty_members = Faculty.objects.all()
updated_count = 0
for fac in faculty_members:
    try:
        user = User.objects.get(email=fac.email, role='faculty')
        if not user.user_id:
            user.user_id = fac.faculty_id
            user.save()
            updated_count += 1
    except User.DoesNotExist:
        try:
            from django.contrib.auth.hashers import make_password
            user = User.objects.create(
                email=fac.email,
                username=fac.email.split('@')[0][:30],
                first_name=fac.first_name[:30],
                last_name=fac.last_name[:30],
                role='faculty',
                user_id=fac.faculty_id,
                password=make_password(fac.passcode)
            )
            updated_count += 1
            print(f"  Created user for Faculty: {fac.email}")
        except Exception as e:
            print(f"  Error creating user for {fac.email}: {e}")

print(f"✓ Updated {updated_count} Faculty users")

# Fix Management users
print("\n[3/4] Fixing Management user_id mapping...")
mgmt_employees = ManagementEmployee.objects.all()
updated_count = 0
for emp in mgmt_employees:
    try:
        user = User.objects.get(email=emp.email, role='management')
        if not user.user_id:
            user.user_id = emp.emp_id
            user.save()
            updated_count += 1
    except User.DoesNotExist:
        try:
            from django.contrib.auth.hashers import make_password
            user = User.objects.create(
                email=emp.email,
                username=emp.email.split('@')[0][:30],
                first_name=emp.first_name[:30],
                last_name=emp.last_name[:30],
                role='management',
                user_id=emp.emp_id,
                password=make_password(emp.passcode)
            )
            updated_count += 1
            print(f"  Created user for Management employee: {emp.email}")
        except Exception as e:
            print(f"  Error creating user for {emp.email}: {e}")

print(f"✓ Updated {updated_count} Management users")

# Fix Student users
print("\n[4/4] Fixing Student user_id mapping...")
students = Student.objects.all()
updated_count = 0
for student in students:
    try:
        user = User.objects.get(email=student.email, role='student')
        if not user.user_id:
            user.user_id = student.student_id
            user.save()
            updated_count += 1
    except User.DoesNotExist:
        try:
            from django.contrib.auth.hashers import make_password
            user = User.objects.create(
                email=student.email,
                username=student.email.split('@')[0][:30],
                first_name=student.first_name[:30],
                last_name=student.last_name[:30],
                role='student',
                user_id=student.student_id,
                password=make_password(student.passcode)
            )
            updated_count += 1
            print(f"  Created user for Student: {student.email}")
        except Exception as e:
            print(f"  Error creating user for {student.email}: {e}")

print(f"✓ Updated {updated_count} Student users")

print("\n" + "="*80)
print("USER_ID LINKAGE FIX COMPLETE")
print("="*80)
