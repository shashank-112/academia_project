#!/usr/bin/env python
"""
Comprehensive Email & User ID Mismatch Audit
Checks entire codebase for email and ID mapping issues
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from users.models import User
from students.models import Student
from faculty.models import Faculty
from management.models import ManagementEmployee
from tpcell.models import TPCellEmployee

print("="*100)
print("COMPREHENSIVE EMAIL & USER ID MISMATCH AUDIT")
print("="*100)

# Track results
total_issues = 0
critical_issues = 0

# ============================================================================
# 1. STUDENT AUDIT
# ============================================================================
print("\n" + "="*100)
print("1. STUDENT EMAIL & ID AUDIT")
print("="*100)

student_issues = []
student_users = User.objects.filter(role='student')
print(f"\nTotal Student Users: {student_users.count()}")
print(f"Total Student Records: {Student.objects.count()}")

for user in student_users:
    student = Student.objects.filter(student_id=user.user_id).first() if user.user_id else None
    email_match = Student.objects.filter(email=user.email).first()
    
    issues = []
    
    # Check 1: user_id is set
    if user.user_id is None:
        issues.append("❌ user_id is NULL")
        
    # Check 2: Email match
    if not email_match:
        issues.append(f"❌ Email '{user.email}' not found in Student table")
    elif email_match.student_id != user.user_id:
        issues.append(f"❌ Email matches student {email_match.student_id}, but user_id={user.user_id}")
    else:
        issues.append(f"✓ Email & ID match: student_id={user.user_id}")
    
    # Check 3: Student record exists
    if student is None and user.user_id:
        issues.append(f"❌ No Student record with student_id={user.user_id}")
    elif student and student.email != user.email:
        issues.append(f"❌ Student email mismatch: User='{user.email}', Student='{student.email}'")
    
    if len([i for i in issues if '❌' in i]) > 0:
        student_issues.append({
            'user_email': user.email,
            'user_id': user.user_id,
            'issues': issues
        })

if student_issues:
    print(f"\n⚠ Found {len(student_issues)} student user issues:")
    for issue in student_issues[:10]:  # Show first 10
        print(f"\n  User: {issue['user_email']} (user_id={issue['user_id']})")
        for msg in issue['issues']:
            print(f"    {msg}")
    total_issues += len(student_issues)
    critical_issues += sum(1 for issue in student_issues if any('❌' in msg for msg in issue['issues']))
else:
    print("\n✓ All student users properly mapped")

# ============================================================================
# 2. FACULTY AUDIT
# ============================================================================
print("\n" + "="*100)
print("2. FACULTY EMAIL & ID AUDIT")
print("="*100)

faculty_issues = []
faculty_users = User.objects.filter(role='faculty')
print(f"\nTotal Faculty Users: {faculty_users.count()}")
print(f"Total Faculty Records: {Faculty.objects.count()}")

for user in faculty_users:
    faculty = Faculty.objects.filter(faculty_id=user.user_id).first() if user.user_id else None
    email_match = Faculty.objects.filter(email=user.email).first()
    
    issues = []
    
    # Check 1: user_id is set
    if user.user_id is None:
        issues.append("❌ user_id is NULL")
        
    # Check 2: Email match
    if not email_match:
        issues.append(f"❌ Email '{user.email}' not found in Faculty table")
    elif email_match.faculty_id != user.user_id:
        issues.append(f"❌ Email matches faculty {email_match.faculty_id}, but user_id={user.user_id}")
    else:
        issues.append(f"✓ Email & ID match: faculty_id={user.user_id}")
    
    # Check 3: Faculty record exists
    if faculty is None and user.user_id:
        issues.append(f"❌ No Faculty record with faculty_id={user.user_id}")
    elif faculty and faculty.email != user.email:
        issues.append(f"❌ Faculty email mismatch: User='{user.email}', Faculty='{faculty.email}'")
    
    if len([i for i in issues if '❌' in i]) > 0:
        faculty_issues.append({
            'user_email': user.email,
            'user_id': user.user_id,
            'issues': issues
        })

if faculty_issues:
    print(f"\n⚠ Found {len(faculty_issues)} faculty user issues:")
    for issue in faculty_issues[:10]:
        print(f"\n  User: {issue['user_email']} (user_id={issue['user_id']})")
        for msg in issue['issues']:
            print(f"    {msg}")
    total_issues += len(faculty_issues)
    critical_issues += sum(1 for issue in faculty_issues if any('❌' in msg for msg in issue['issues']))
else:
    print("\n✓ All faculty users properly mapped")

# ============================================================================
# 3. TP CELL AUDIT
# ============================================================================
print("\n" + "="*100)
print("3. TP CELL EMAIL & ID AUDIT")
print("="*100)

tpcell_issues = []
tpcell_users = User.objects.filter(role='tpcell')
print(f"\nTotal TP Cell Users: {tpcell_users.count()}")
print(f"Total TP Cell Records: {TPCellEmployee.objects.count()}")

for user in tpcell_users:
    # Check both emp_id match and email match
    if user.user_id:
        emp_id_match = TPCellEmployee.objects.filter(emp_id=user.user_id).first()
    else:
        emp_id_match = None
    email_match = TPCellEmployee.objects.filter(email=user.email).first()
    
    issues = []
    
    # Check 1: user_id is set
    if user.user_id is None:
        issues.append("❌ user_id is NULL (fallback to email lookup)")
        
    # Check 2: Email match
    if not email_match:
        issues.append(f"❌ Email '{user.email}' not found in TPCellEmployee table")
    elif user.user_id and email_match.emp_id != user.user_id:
        issues.append(f"❌ Email matches emp_id {email_match.emp_id}, but user_id={user.user_id}")
    else:
        issues.append(f"✓ Email match: emp_id={email_match.emp_id if email_match else 'N/A'}")
    
    # Check 3: Emp record exists
    if user.user_id and emp_id_match is None:
        issues.append(f"❌ No TP Cell record with emp_id={user.user_id}")
    elif emp_id_match and emp_id_match.email != user.email:
        issues.append(f"❌ TP Cell email mismatch: User='{user.email}', Employee='{emp_id_match.email}'")
    
    if len([i for i in issues if '❌' in i]) > 0:
        tpcell_issues.append({
            'user_email': user.email,
            'user_id': user.user_id,
            'issues': issues
        })

if tpcell_issues:
    print(f"\n⚠ Found {len(tpcell_issues)} TP Cell user issues:")
    for issue in tpcell_issues:
        print(f"\n  User: {issue['user_email']} (user_id={issue['user_id']})")
        for msg in issue['issues']:
            print(f"    {msg}")
    total_issues += len(tpcell_issues)
    critical_issues += sum(1 for issue in tpcell_issues if any('❌' in msg for msg in issue['issues']))
else:
    print("\n✓ All TP Cell users properly mapped (or can use email fallback)")

# ============================================================================
# 4. MANAGEMENT AUDIT
# ============================================================================
print("\n" + "="*100)
print("4. MANAGEMENT EMAIL & ID AUDIT")
print("="*100)

mgmt_issues = []
mgmt_users = User.objects.filter(role='management')
print(f"\nTotal Management Users: {mgmt_users.count()}")
print(f"Total Management Records: {ManagementEmployee.objects.count()}")

for user in mgmt_users:
    # Check both emp_id match and email match
    if user.user_id:
        emp_id_match = ManagementEmployee.objects.filter(emp_id=user.user_id).first()
    else:
        emp_id_match = None
    email_match = ManagementEmployee.objects.filter(email=user.email).first()
    
    issues = []
    
    # Check 1: user_id is set
    if user.user_id is None:
        issues.append("❌ user_id is NULL (fallback to email lookup)")
        
    # Check 2: Email match
    if not email_match:
        issues.append(f"❌ Email '{user.email}' not found in ManagementEmployee table")
    elif user.user_id and email_match.emp_id != user.user_id:
        issues.append(f"❌ Email matches emp_id {email_match.emp_id}, but user_id={user.user_id}")
    else:
        issues.append(f"✓ Email match: emp_id={email_match.emp_id if email_match else 'N/A'}")
    
    # Check 3: Emp record exists
    if user.user_id and emp_id_match is None:
        issues.append(f"❌ No Management record with emp_id={user.user_id}")
    elif emp_id_match and emp_id_match.email != user.email:
        issues.append(f"❌ Management email mismatch: User='{user.email}', Employee='{emp_id_match.email}'")
    
    if len([i for i in issues if '❌' in i]) > 0:
        mgmt_issues.append({
            'user_email': user.email,
            'user_id': user.user_id,
            'issues': issues
        })

if mgmt_issues:
    print(f"\n⚠ Found {len(mgmt_issues)} Management user issues:")
    for issue in mgmt_issues:
        print(f"\n  User: {issue['user_email']} (user_id={issue['user_id']})")
        for msg in issue['issues']:
            print(f"    {msg}")
    total_issues += len(mgmt_issues)
    critical_issues += sum(1 for issue in mgmt_issues if any('❌' in msg for msg in issue['issues']))
else:
    print("\n✓ All Management users properly mapped (or can use email fallback)")

# ============================================================================
# 5. ORPHANED RECORDS (Employees with no User)
# ============================================================================
print("\n" + "="*100)
print("5. ORPHANED EMPLOYEE RECORDS AUDIT")
print("="*100)

orphaned = []

print("\nTP Cell Employees with no matching User:")
for emp in TPCellEmployee.objects.all():
    user = User.objects.filter(email=emp.email, role='tpcell').first()
    if not user:
        orphaned.append(f"  ❌ {emp.email} (emp_id={emp.emp_id})")
        print(f"  ❌ {emp.email} (emp_id={emp.emp_id})")

print("\nManagement Employees with no matching User:")
for emp in ManagementEmployee.objects.all():
    user = User.objects.filter(email=emp.email, role='management').first()
    if not user:
        orphaned.append(f"  ❌ {emp.email} (emp_id={emp.emp_id})")
        print(f"  ❌ {emp.email} (emp_id={emp.emp_id})")

print("\nFaculty with no matching User:")
for fac in Faculty.objects.all():
    user = User.objects.filter(email=fac.email, role='faculty').first()
    if not user:
        orphaned.append(f"  ❌ {fac.email} (faculty_id={fac.faculty_id})")
        print(f"  ❌ {fac.email} (faculty_id={fac.faculty_id})")

# ============================================================================
# 6. SUMMARY
# ============================================================================
print("\n" + "="*100)
print("AUDIT SUMMARY")
print("="*100)

print(f"\nTotal Issues Found: {total_issues}")
print(f"Critical Issues: {critical_issues}")
print(f"Orphaned Records: {len(orphaned)}")

print("\n" + "="*100)
print("RECOMMENDATIONS")
print("="*100)

if critical_issues > 0:
    print("""
❌ CRITICAL ISSUES DETECTED:

1. NULL user_id values: Run tools/backfill_user_user_id.py to fix
2. Email mismatches: Check CSV and database for inconsistencies  
3. Missing employee records: Create missing records in database

NEXT STEPS:
1. Run: python manage.py shell < tools/backfill_user_user_id.py
2. Or run: python fix_tpcell_management_mapping.py
3. Then run: python fix_faculty_user_mapping.py
4. Finally: python load_all_data_complete.py again if needed
""")
elif len(orphaned) > 0:
    print(f"""
⚠ ORPHANED RECORDS DETECTED:

{len(orphaned)} employee records have no corresponding User in the system.
These employees cannot log in.

SOLUTION:
Create User accounts for orphaned employees OR re-run data loading script.
""")
else:
    print("""
✓ ALL SYSTEMS NOMINAL!

All users are properly mapped to their employee/student records.
Emails match and user_id values are set correctly.
    """)

print("\n" + "="*100)
