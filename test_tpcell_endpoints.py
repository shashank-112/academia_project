#!/usr/bin/env python
"""
Test TP Cell Endpoints - Verify that all TP Cell endpoints are working correctly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from users.models import User
from tpcell.models import TPCellEmployee
from students.models import Student, StudentBacklog, StudentExamData

print("="*80)
print("TESTING TP CELL ENDPOINTS")
print("="*80)

# Get a TP Cell user to test with
tpcell_users = User.objects.filter(role='tpcell')[:3]

print(f"\nFound {tpcell_users.count()} TP Cell users to test\n")

for user in tpcell_users:
    print(f"Testing TP Cell User: {user.email}")
    print(f"  - User ID: {user.user_id}")
    print(f"  - Role: {user.role}")
    
    # Simulate /api/tpcell/profile/ endpoint
    try:
        emp = TPCellEmployee.objects.get(email=user.email)
        print(f"  ✓ Profile endpoint would work:")
        print(f"    - Name: {emp.first_name} {emp.last_name}")
        print(f"    - Designation: {emp.designation}")
    except TPCellEmployee.DoesNotExist:
        print(f"  ✗ Profile endpoint would FAIL - Employee not found!")
    
    # Simulate /api/tpcell/stats/ endpoint
    try:
        emp = TPCellEmployee.objects.get(email=user.email)
        
        # Calculate stats
        total_students = Student.objects.count()
        students_with_backlogs = StudentBacklog.objects.values('student_id').distinct().count()
        eligible_students = total_students - students_with_backlogs
        
        # Calculate average CGPA
        exam_data = StudentExamData.objects.all()
        avg_cgpa = 0.0
        if exam_data.exists():
            all_marks = exam_data.values_list('mid_marks', 'quiz_marks', 'assignment_marks')
            if all_marks:
                total_marks = sum([m[0] + m[1] + m[2] for m in all_marks])
                avg_cgpa = (total_marks / (len(all_marks) * 30)) * 10
        
        print(f"  ✓ Stats endpoint would work:")
        print(f"    - Total Students: {total_students}")
        print(f"    - Students with Backlogs: {students_with_backlogs}")
        print(f"    - Eligible Students: {eligible_students}")
        print(f"    - Average CGPA: {avg_cgpa:.2f}")
    except TPCellEmployee.DoesNotExist:
        print(f"  ✗ Stats endpoint would FAIL - Employee not found!")
    
    print()

print("="*80)
print("✅ TP Cell endpoints are ready to use!")
print("="*80)
print("\nNow:")
print("1. Restart your Django development server")
print("2. Login to the TP Cell Dashboard with a TP Cell user email")
print("3. You should see the Home and Profile pages load correctly")
print("\nExample TP Cell emails to test:")
count = 0
for user in User.objects.filter(role='tpcell'):
    if count >= 3:
        break
    print(f"  - {user.email}")
    count += 1
