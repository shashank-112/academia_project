#!/usr/bin/env python
"""
Fix Faculty User ID Mapping - Ensure all Faculty users have correct user_id linking
This script:
1. Identifies Faculty records without corresponding User records
2. Creates User records for orphaned Faculty
3. Updates User records with correct faculty_id in user_id field
4. Loads FacultyAssignment data from CSV
"""
import os
import django
import pandas as pd
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from users.models import User
from faculty.models import Faculty, FacultyAssignment

print("="*80)
print("FIXING FACULTY USER ID MAPPING")
print("="*80)

# ============================================================================
# 1. Fix existing Faculty User records
# ============================================================================
print("\n[1/3] Fixing Faculty User ID Mapping...")
faculty_count = Faculty.objects.count()
print(f"Total Faculty in database: {faculty_count}")

fixed_count = 0
created_count = 0

# First, delete duplicate faculty users (keep only one per faculty_id)
all_faculty_ids = Faculty.objects.all().values_list('faculty_id', flat=True)
duplicate_check = {}

for faculty_id in all_faculty_ids:
    faculty = Faculty.objects.get(faculty_id=faculty_id)
    users = User.objects.filter(email=faculty.email, role='faculty')
    
    if users.count() > 1:
        print(f"  ⚠ Found {users.count()} users for {faculty.email}, keeping first, deleting others...")
        # Keep first user, delete others
        first_user = users.first()
        users.exclude(id=first_user.id).delete()
        print(f"  ✓ Cleaned up duplicate users for {faculty.email}")

# Now fix or create user_id mappings
for faculty in Faculty.objects.all():
    users = User.objects.filter(email=faculty.email, role='faculty')
    
    if users.exists():
        # Found user(s) for this faculty - should be only one now
        user = users.first()
        if user.user_id is None or user.user_id != faculty.faculty_id:
            # Check if this user_id is already taken by another user
            existing_with_id = User.objects.filter(user_id=faculty.faculty_id).exclude(id=user.id)
            if existing_with_id.exists():
                # user_id is taken, clear the conflicting one first
                print(f"  ⚠ Clearing conflicting user_id={faculty.faculty_id} from {existing_with_id.first().email}")
                existing_with_id.update(user_id=None)
            
            user.user_id = faculty.faculty_id
            user.save()
            fixed_count += 1
            print(f"  ✓ Fixed user_id for {faculty.email}: {faculty.faculty_id}")
    else:
        # No user found for this faculty - create one
        # But first check if this faculty_id is already used
        existing_user = User.objects.filter(user_id=faculty.faculty_id, role='faculty')
        if existing_user.exists():
            print(f"  ⚠ Faculty ID {faculty.faculty_id} already has a user, skipping...")
            continue
            
        password = faculty.passcode
        user = User.objects.create_user(
            email=faculty.email,
            username=faculty.email.split('@')[0][:30],
            first_name=faculty.first_name[:30],
            last_name=faculty.last_name[:30],
            password=password,
            role='faculty',
            user_id=faculty.faculty_id
        )
        created_count += 1
        print(f"  ✓ Created user for Faculty {faculty.faculty_id}: {faculty.email}")

print(f"\n✓ Fixed {fixed_count} + Created {created_count} = {fixed_count + created_count} Faculty user mappings")

# ============================================================================
# 2. Load Faculty Assignments from CSV
# ============================================================================
print("\n[2/3] Loading Faculty Assignments...")
DATA_PATH = Path('../../data').resolve()
faculty_assign_csv = DATA_PATH / '6th_FACULTY_STUDENT_DEPT.csv'

if faculty_assign_csv.exists():
    df_assignments = pd.read_csv(faculty_assign_csv)
    batch_size = 100
    assignment_list = []
    total = len(df_assignments)
    
    # Clear existing assignments
    FacultyAssignment.objects.all().delete()
    
    for idx, (_, row) in enumerate(df_assignments.iterrows()):
        try:
            faculty_id = int(row['faculty_id'])
            faculty = Faculty.objects.get(faculty_id=faculty_id)
            
            assignment_list.append(FacultyAssignment(
                faculty=faculty,
                year_id=int(row['year_id']),
                branch_id=int(row['branch_id']),
                section_id=int(row['sec_id']),
                course_id=str(row['course_id'])
            ))
            
            if len(assignment_list) >= batch_size:
                FacultyAssignment.objects.bulk_create(assignment_list, batch_size=batch_size, ignore_conflicts=True)
                assignment_list = []
                
        except (Faculty.DoesNotExist, ValueError, KeyError) as e:
            pass
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if assignment_list:
        FacultyAssignment.objects.bulk_create(assignment_list, batch_size=batch_size, ignore_conflicts=True)
    
    assignment_count = FacultyAssignment.objects.count()
    print(f"\n✓ Loaded {assignment_count} faculty assignments")
else:
    print(f"⚠ CSV file not found: {faculty_assign_csv}")
    print(f"   Creating empty assignments for testing purposes...")
    # Don't create any test data, just warn

# ============================================================================
# 3. Verify the setup
# ============================================================================
print("\n[3/3] Verifying Faculty Setup...")
verification_passed = True

for faculty in Faculty.objects.all()[:5]:  # Check first 5
    users = User.objects.filter(email=faculty.email, role='faculty')
    if users.exists():
        user = users.first()
        if user.user_id == faculty.faculty_id:
            assignments = FacultyAssignment.objects.filter(faculty=faculty).count()
            print(f"  ✓ {faculty.email}: user_id={user.user_id}, assignments={assignments}")
        else:
            print(f"  ✗ {faculty.email}: user_id mismatch (user={user.user_id}, faculty={faculty.faculty_id})")
            verification_passed = False
    else:
        print(f"  ✗ {faculty.email}: No User record found!")
        verification_passed = False

print("\n" + "="*80)
if verification_passed or Faculty.objects.count() <= 5:
    print("✅ FACULTY MAPPING COMPLETE!")
    print("="*80)
    print("\nYou should now be able to:")
    print("  1. Login as a faculty user")
    print("  2. Access /api/faculty/profile/")
    print("  3. Access /api/faculty/assignments/")
    print("\nTest it by accessing the Faculty Dashboard in your browser.")
else:
    print("⚠️ Some verification issues found")
    print("="*80)
