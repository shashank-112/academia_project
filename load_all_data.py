#!/usr/bin/env python
"""
Load all data from CSV files into the database
"""
import os
import django
import pandas as pd
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from users.models import User
from students.models import Student
from faculty.models import Faculty
from tpcell.models import TPCellEmployee
from management.models import ManagementEmployee

DATA_PATH = Path('../../data').resolve()

print("="*80)
print("LOADING DATA INTO DATABASE")
print("="*80)

# ============================================================================
# 1. LOAD STUDENT DATA
# ============================================================================
print("\n[1/4] Loading Student Data...")
students_csv = DATA_PATH / '1th_STUDENT_PERSONAL_INFO.csv'

if students_csv.exists():
    df_students = pd.read_csv(students_csv)
    batch_size = 100
    users_list = []
    students_list = []
    total = len(df_students)
    
    for idx, (_, row) in enumerate(df_students.iterrows()):
        email = row['email']
        password = str(int(row['passcode']))
        
        if Student.objects.filter(student_id=row['student_id']).exists():
            continue
        
        if not User.objects.filter(email=email).exists():
            users_list.append(User(
                email=email,
                username=email.split('@')[0][:30],
                first_name=row['first_name'][:30],
                last_name=row['last_name'][:30],
                role='student',
                user_id=int(row['student_id']),  # ← ADD THIS: Set user_id to student_id
                password=make_password(password)
            ))
        
        students_list.append(Student(
            student_id=int(row['student_id']),
            first_name=row['first_name'],
            last_name=row['last_name'],
            email=email,
            gender=row['gender'],
            year_id=int(row['year_id']),
            branch_id=int(row['branch_id']),
            sec_id=int(row['sec_id']),
            roll_no=int(row['roll_no']),
            phone_no=str(int(row['phone_no'])),
            ssc_marks=float(row['ssc_marks']) if pd.notna(row['ssc_marks']) else None,
            inter_marks=float(row['inter_marks']) if pd.notna(row['inter_marks']) else None,
            passcode=password
        ))
        
        if len(users_list) >= batch_size:
            User.objects.bulk_create(users_list, batch_size=batch_size, ignore_conflicts=True)
            users_list = []
        if len(students_list) >= batch_size:
            Student.objects.bulk_create(students_list, batch_size=batch_size, ignore_conflicts=True)
            students_list = []
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if users_list:
        User.objects.bulk_create(users_list, batch_size=batch_size, ignore_conflicts=True)
    if students_list:
        Student.objects.bulk_create(students_list, batch_size=batch_size, ignore_conflicts=True)
    
    student_count = Student.objects.count()
    print(f"\n✓ Loaded {student_count} students")
else:
    print(f"✗ File not found: {students_csv}")

# ============================================================================
# 2. LOAD FACULTY DATA
# ============================================================================
print("\n[2/4] Loading Faculty Data...")
faculty_csv = DATA_PATH / '5th_FACULTY_INFO.csv'

if faculty_csv.exists():
    df_faculty = pd.read_csv(faculty_csv)
    batch_size = 50
    users_list = []
    faculty_list = []
    total = len(df_faculty)
    
    for idx, (_, row) in enumerate(df_faculty.iterrows()):
        email = row['email']
        password = str(int(row['passcode']))
        
        if Faculty.objects.filter(faculty_id=row['faculty_id']).exists():
            continue
        
        if not User.objects.filter(email=email).exists():
            users_list.append(User(
                email=email,
                username=email.split('@')[0][:30],
                first_name=row['first_name'][:30],
                last_name=row['last_name'][:30],
                role='faculty',
                user_id=int(row['faculty_id']),  # ← ADD THIS: Set user_id to faculty_id
                password=make_password(password)
            ))
        
        faculty_list.append(Faculty(
            faculty_id=int(row['faculty_id']),
            first_name=str(row['first_name'])[:100],
            last_name=str(row['last_name'])[:100],
            email=email,
            passcode=password,
            gender=str(row['gender'])[:10],
            department=str(row['department'])[:100],
            designation=str(row['designation'])[:100],
            qualifications=str(row.get('qualifications', ''))[:100] if pd.notna(row.get('qualifications')) else ''
        ))
        
        if len(users_list) >= batch_size:
            User.objects.bulk_create(users_list, batch_size=batch_size, ignore_conflicts=True)
            users_list = []
        if len(faculty_list) >= batch_size:
            Faculty.objects.bulk_create(faculty_list, batch_size=batch_size, ignore_conflicts=True)
            faculty_list = []
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if users_list:
        User.objects.bulk_create(users_list, batch_size=batch_size, ignore_conflicts=True)
    if faculty_list:
        Faculty.objects.bulk_create(faculty_list, batch_size=batch_size, ignore_conflicts=True)
    
    faculty_count = Faculty.objects.count()
    print(f"\n✓ Loaded {faculty_count} faculty members")
else:
    print(f"✗ File not found: {faculty_csv}")

# ============================================================================
# 3. LOAD TP CELL DATA
# ============================================================================
print("\n[3/4] Loading TP Cell Data...")
tpcell_csv = DATA_PATH / '7th_TP_CELL.csv'

if tpcell_csv.exists():
    df_tpcell = pd.read_csv(tpcell_csv)
    batch_size = 20
    users_list = []
    tpcell_list = []
    total = len(df_tpcell)
    
    for idx, (_, row) in enumerate(df_tpcell.iterrows()):
        email = row['email']
        password = str(int(row['passcode']))
        
        if TPCellEmployee.objects.filter(emp_id=row['emp_id']).exists():
            continue
        
        if not User.objects.filter(email=email).exists():
            users_list.append(User(
                email=email,
                username=email.split('@')[0][:30],
                first_name=row['first_name'][:30],
                last_name=row['last_name'][:30],
                role='tpcell',
                user_id=int(row['emp_id']),  # ← ADD THIS: Set user_id to emp_id
                password=make_password(password)
            ))
        
        tpcell_list.append(TPCellEmployee(
            emp_id=int(row['emp_id']),
            first_name=str(row['first_name'])[:100],
            last_name=str(row['last_name'])[:100],
            email=email,
            passcode=password,
            gender=str(row['gender'])[:10],
            designation=str(row['designation'])[:100]
        ))
        
        if len(users_list) >= batch_size:
            User.objects.bulk_create(users_list, batch_size=batch_size, ignore_conflicts=True)
            users_list = []
        if len(tpcell_list) >= batch_size:
            TPCellEmployee.objects.bulk_create(tpcell_list, batch_size=batch_size, ignore_conflicts=True)
            tpcell_list = []
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if users_list:
        User.objects.bulk_create(users_list, batch_size=batch_size, ignore_conflicts=True)
    if tpcell_list:
        TPCellEmployee.objects.bulk_create(tpcell_list, batch_size=batch_size, ignore_conflicts=True)
    
    tpcell_count = TPCellEmployee.objects.count()
    print(f"\n✓ Loaded {tpcell_count} TP Cell employees")
else:
    print(f"✗ File not found: {tpcell_csv}")

# ============================================================================
# 4. LOAD MANAGEMENT DATA
# ============================================================================
print("\n[4/4] Loading Management Data...")
management_csv = DATA_PATH / '8th_MANAGEMENT.csv'

if management_csv.exists():
    df_management = pd.read_csv(management_csv)
    batch_size = 20
    users_list = []
    mgmt_list = []
    total = len(df_management)
    
    for idx, (_, row) in enumerate(df_management.iterrows()):
        email = row['email']
        password = str(int(row['passcode']))
        
        if ManagementEmployee.objects.filter(emp_id=row['emp_id']).exists():
            continue
        
        if not User.objects.filter(email=email).exists():
            users_list.append(User(
                email=email,
                username=email.split('@')[0][:30],
                first_name=row['first_name'][:30],
                last_name=row['last_name'][:30],
                role='management',
                user_id=int(row['emp_id']),  # ← ADD THIS: Set user_id to emp_id
                password=make_password(password)
            ))
        
        mgmt_list.append(ManagementEmployee(
            emp_id=int(row['emp_id']),
            first_name=str(row['first_name'])[:100],
            last_name=str(row['last_name'])[:100],
            email=email,
            passcode=password,
            gender=str(row['gender'])[:10],
            designation=str(row['designation'])[:100]
        ))
        
        if len(users_list) >= batch_size:
            User.objects.bulk_create(users_list, batch_size=batch_size, ignore_conflicts=True)
            users_list = []
        if len(mgmt_list) >= batch_size:
            ManagementEmployee.objects.bulk_create(mgmt_list, batch_size=batch_size, ignore_conflicts=True)
            mgmt_list = []
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if users_list:
        User.objects.bulk_create(users_list, batch_size=batch_size, ignore_conflicts=True)
    if mgmt_list:
        ManagementEmployee.objects.bulk_create(mgmt_list, batch_size=batch_size, ignore_conflicts=True)
    
    mgmt_count = ManagementEmployee.objects.count()
    print(f"\n✓ Loaded {mgmt_count} management employees")
else:
    print(f"✗ File not found: {management_csv}")

# ============================================================================
# Summary
# ============================================================================
print("\n" + "="*80)
print("✓ DATA LOADING COMPLETE!")
print("="*80)

user_count = User.objects.count()
student_count = Student.objects.count()
faculty_count = Faculty.objects.count()
tpcell_count = TPCellEmployee.objects.count()
mgmt_count = ManagementEmployee.objects.count()

print(f"\nDatabase Summary:")
print(f"  Total Users:               {user_count}")
print(f"  Students:                  {student_count}")
print(f"  Faculty:                   {faculty_count}")
print(f"  TP Cell Employees:         {tpcell_count}")
print(f"  Management Employees:      {mgmt_count}")
print(f"\n✓ Default password for all accounts: 1234")
print(f"✓ You can now login with any email from the CSV files!")
print("="*80)
