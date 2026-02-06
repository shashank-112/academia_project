#!/usr/bin/env python
"""
Fix lyon.bonellie@college.edu faculty user credentials
"""
import os
import django
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from users.models import User
from faculty.models import Faculty

print("="*80)
print("FIXING LYON BONELLIE FACULTY USER")
print("="*80)

email = 'lyon.bonellie@college.edu'
password = '1234'
role = 'faculty'

print(f"\n1. Checking Faculty table...")
try:
    faculty = Faculty.objects.get(email=email)
    print(f"✓ Faculty found in Faculty table:")
    print(f"  - Email: {faculty.email}")
    print(f"  - First Name: {faculty.first_name}")
    print(f"  - Last Name: {faculty.last_name}")
    print(f"  - Faculty ID: {faculty.faculty_id}")
except Faculty.DoesNotExist:
    print(f"✗ Faculty not found in Faculty table")

print(f"\n2. Checking Users table...")
users = User.objects.filter(email=email)
if users.exists():
    print(f"✗ Found {users.count()} user(s) with this email:")
    for u in users:
        print(f"  - Role: {u.role}, Username: {u.username}")
    
    # Delete all old versions
    print(f"\n3. Removing old user entries...")
    users.delete()
    print(f"✓ Removed {users.count()} old user(s)")
else:
    print(f"✗ No user found in Users table")

print(f"\n4. Creating new faculty user...")
user = User.objects.create_user(
    email=email,
    username=email.split('@')[0][:30],
    first_name='Lyon',
    last_name='Bonellie',
    password=password,
    role=role
)
print(f"✓ User created successfully!")
print(f"  - Email: {user.email}")
print(f"  - Role: {user.role}")
print(f"  - Username: {user.username}")

print(f"\n5. Verifying password...")
if user.check_password(password):
    print(f"✓ Password verification successful!")
    print(f"  - Password hash: {user.password[:50]}...")
else:
    print(f"✗ Password verification failed!")
    # Try to fix it
    user.set_password(password)
    user.save()
    print(f"✓ Password re-set successfully!")

print(f"\n6. Final verification...")
verify_user = User.objects.get(email=email, role=role)
if verify_user.check_password(password):
    print(f"✓ USER IS READY TO LOGIN!")
    print(f"\nLogin details:")
    print(f"  Email: {email}")
    print(f"  Password: {password}")
    print(f"  Role: faculty")
else:
    print(f"✗ Something went wrong!")

print(f"\n{'='*80}\n")
