#!/usr/bin/env python
"""
Test login functionality
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.contrib.auth import authenticate
from users.models import User

# Test with a known student
email = '1ycsea1@college.edu'
password = '1234'
role = 'student'

print(f"\n{'='*80}")
print("TESTING LOGIN FUNCTIONALITY")
print(f"{'='*80}\n")

print(f"1. Checking if user exists by email and role...")
try:
    user = User.objects.get(email=email, role=role)
    print(f"✓ User found!")
    print(f"  - Email: {user.email}")
    print(f"  - Username: {user.username}")
    print(f"  - Role: {user.role}")
    print(f"  - First Name: {user.first_name}")
    print(f"  - Last Name: {user.last_name}")
except User.DoesNotExist:
    print(f"✗ User not found with email={email}, role={role}")
    exit(1)

print(f"\n2. Testing authenticate() with username and password...")
user_auth = authenticate(username=user.username, password=password)
if user_auth:
    print(f"✓ Authentication successful!")
    print(f"  - Authenticated user: {user_auth.username}")
else:
    print(f"✗ Authentication failed!")
    print(f"  - Attempted username: {user.username}")
    print(f"  - Attempted password: {password}")
    
print(f"\n3. Testing direct password check...")
if user.check_password(password):
    print(f"✓ Password check successful with check_password()!")
else:
    print(f"✗ Password check failed!")
    print(f"  - Stored password hash: {user.password[:50]}...")

print(f"\n4. Listing all users with this email...")
users = User.objects.filter(email=email)
print(f"Found {users.count()} user(s):")
for u in users:
    print(f"  - {u.email} ({u.role}) - username: {u.username}")

print(f"\n{'='*80}\n")
