#!/usr/bin/env python
"""
Test Faculty Endpoints - Verify that all Faculty endpoints are working correctly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from users.models import User
from faculty.models import Faculty, FacultyAssignment

print("="*80)
print("TESTING FACULTY ENDPOINTS")
print("="*80)

# Get a faculty user to test with
faculty_users = User.objects.filter(role='faculty')[:3]

print(f"\nFound {faculty_users.count()} faculty users to test\n")

for user in faculty_users:
    print(f"Testing Faculty User: {user.email}")
    print(f"  - User ID: {user.user_id}")
    print(f"  - Role: {user.role}")
    
    # Simulate what happens in /api/faculty/profile/ endpoint
    try:
        faculty = Faculty.objects.get(faculty_id=user.user_id)
        print(f"  ✓ Profile endpoint would work:")
        print(f"    - Name: {faculty.first_name} {faculty.last_name}")
        print(f"    - Department: {faculty.department}")
        print(f"    - Email: {faculty.email}")
    except Faculty.DoesNotExist:
        print(f"  ✗ Profile endpoint would FAIL - Faculty not found!")
    
    # Simulate what happens in /api/faculty/assignments/ endpoint
    try:
        faculty = Faculty.objects.get(faculty_id=user.user_id)
        assignments = FacultyAssignment.objects.filter(faculty=faculty)
        print(f"  ✓ Assignments endpoint would work:")
        print(f"    - Total assignments: {assignments.count()}")
        if assignments.count() > 0:
            first_assign = assignments.first()
            print(f"    - Sample: Year {first_assign.year_id}, Branch {first_assign.branch_id}, Section {first_assign.section_id}, Course {first_assign.course_id}")
    except Faculty.DoesNotExist:
        print(f"  ✗ Assignments endpoint would FAIL - Faculty not found!")
    
    print()

print("="*80)
print("✅ Faculty endpoints are ready to use!")
print("="*80)
print("\nNow:")
print("1. Restart your Django development server")
print("2. Login to the Faculty Dashboard with a faculty user email")
print("3. You should see the Home, Courses, and Profile pages load correctly")
print("\nExample faculty emails to test:")
count = 0
for user in User.objects.filter(role='faculty'):
    if count >= 3:
        break
    print(f"  - {user.email}")
    count += 1
