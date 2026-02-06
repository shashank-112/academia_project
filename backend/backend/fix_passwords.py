#!/usr/bin/env python
"""
Fix user passwords - recreate all users with proper password hashing
"""
import os
import django
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from users.models import User
from students.models import Student
from faculty.models import Faculty
from tpcell.models import TPCellEmployee
from management.models import ManagementEmployee

print("="*80)
print("FIXING USER PASSWORDS")
print("="*80)

# Fix students
print("\n[1/4] Fixing Student Passwords...")
students = Student.objects.all()
users_to_update = []
count = 0

for student in students:
    user = User.objects.filter(email=student.email, role='student').first()
    if user:
        password = student.passcode
        user.password = make_password(password)
        users_to_update.append(user)
        count += 1
        
        if len(users_to_update) >= 50:
            User.objects.bulk_update(users_to_update, ['password'], batch_size=50)
            users_to_update = []
            print(f"  ...fixed {count} students", end='\r', flush=True)

if users_to_update:
    User.objects.bulk_update(users_to_update, ['password'], batch_size=50)

print(f"\n✓ Fixed {count} student passwords")

# Fix faculty
print("\n[2/4] Fixing Faculty Passwords...")
faculty = Faculty.objects.all()
users_to_update = []
count = 0

for fac in faculty:
    user = User.objects.filter(email=fac.email, role='faculty').first()
    if user:
        password = fac.passcode
        user.password = make_password(password)
        users_to_update.append(user)
        count += 1
        
        if len(users_to_update) >= 20:
            User.objects.bulk_update(users_to_update, ['password'], batch_size=20)
            users_to_update = []

if users_to_update:
    User.objects.bulk_update(users_to_update, ['password'], batch_size=20)

print(f"✓ Fixed {count} faculty passwords")

# Fix TP Cell
print("\n[3/4] Fixing TP Cell Passwords...")
tpcell = TPCellEmployee.objects.all()
users_to_update = []
count = 0

for emp in tpcell:
    user = User.objects.filter(email=emp.email, role='tpcell').first()
    if user:
        password = emp.passcode
        user.password = make_password(password)
        users_to_update.append(user)
        count += 1

if users_to_update:
    User.objects.bulk_update(users_to_update, ['password'], batch_size=10)

print(f"✓ Fixed {count} TP Cell passwords")

# Fix Management
print("\n[4/4] Fixing Management Passwords...")
mgmt = ManagementEmployee.objects.all()
users_to_update = []
count = 0

for emp in mgmt:
    user = User.objects.filter(email=emp.email, role='management').first()
    if user:
        password = emp.passcode
        user.password = make_password(password)
        users_to_update.append(user)
        count += 1

if users_to_update:
    User.objects.bulk_update(users_to_update, ['password'], batch_size=10)

print(f"✓ Fixed {count} management passwords")

print("\n" + "="*80)
print("✓ ALL PASSWORDS FIXED!")
print("="*80)
print("\n✓ You can now login with any email and password: 1234")
print("\n" + "="*80)
