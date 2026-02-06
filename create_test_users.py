#!/usr/bin/env python
"""
Script to create test users for demo purposes
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from users.models import User

# Test user data
test_users = [
    {
        'email': '4ycsea1@college.edu',
        'password': '1234',
        'role': 'student',
        'first_name': 'Demo',
        'last_name': 'Student',
        'username': 'demostudent'
    },
    {
        'email': 'lyon.bonellie@college.edu',
        'password': '1234',
        'role': 'faculty',
        'first_name': 'Lyon',
        'last_name': 'Bonellie',
        'username': 'lyon.bonellie'
    },
    {
        'email': 'anny.gartery@tpcell.edu',
        'password': '1234',
        'role': 'tpcell',
        'first_name': 'Anny',
        'last_name': 'Gartery',
        'username': 'anny.gartery'
    },
    {
        'email': 'amberly.carryer@management.edu',
        'password': '1234',
        'role': 'management',
        'first_name': 'Amberly',
        'last_name': 'Carryer',
        'username': 'amberly.carryer'
    },
]

for user_data in test_users:
    email = user_data['email']
    
    # Check if user exists
    if User.objects.filter(email=email).exists():
        print(f"✓ User {email} already exists")
        continue
    
    # Create new user
    user = User(
        email=email,
        role=user_data['role'],
        first_name=user_data['first_name'],
        last_name=user_data['last_name'],
        username=user_data['username']
    )
    user.set_password(user_data['password'])
    user.save()
    print(f"✓ Created user: {email} (Role: {user_data['role']})")

print("\n✓ All test users created successfully!")
print("\nDemo Credentials:")
for user_data in test_users:
    print(f"  Email: {user_data['email']}")
    print(f"  Password: {user_data['password']}")
    print(f"  Role: {user_data['role']}\n")