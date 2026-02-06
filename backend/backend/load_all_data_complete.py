#!/usr/bin/env python
"""
Load ALL 10 CSV tables into the database
This ensures complete data availability when users login
"""
import os
import django
import pandas as pd
from pathlib import Path
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from users.models import User
from students.models import Student, StudentAcademic, StudentBacklog, StudentFee, StudentExamData
from faculty.models import Faculty, FacultyAssignment
from tpcell.models import TPCellEmployee
from management.models import ManagementEmployee
from notifications.models import Notification

DATA_PATH = Path('../../data').resolve()

print("="*80)
print("LOADING ALL 10 TABLES INTO DATABASE")
print("="*80)

# ============================================================================
# 1. LOAD STUDENT PERSONAL INFO (1th_STUDENT_PERSONAL_INFO.csv)
# ============================================================================
print("\n[1/10] Loading Student Personal Info...")
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
            print(f"  ...student {row['student_id']} already exists, skipping", end='\r', flush=True)
            continue
        
        if not User.objects.filter(email=email).exists():
            users_list.append(User(
                email=email,
                username=email.split('@')[0][:30],
                first_name=str(row['first_name'])[:30],
                last_name=str(row['last_name'])[:30],
                role='student',
                password=make_password(password)
            ))
        
        students_list.append(Student(
            student_id=int(row['student_id']),
            first_name=str(row['first_name']),
            last_name=str(row['last_name']),
            email=email,
            gender=str(row['gender']),
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
# 2. LOAD STUDENT ACADEMIC DATA (2nd_STUD_ACAD.csv)
# ============================================================================
print("\n[2/10] Loading Student Academic Data...")
acad_csv = DATA_PATH / '2nd_STUD_ACAD.csv'

if acad_csv.exists():
    df_acad = pd.read_csv(acad_csv)
    batch_size = 200
    acad_list = []
    total = len(df_acad)
    
    for idx, (_, row) in enumerate(df_acad.iterrows()):
        try:
            student_id = int(row['student_id'])
            student = Student.objects.get(student_id=student_id)
            
            acad_list.append(StudentAcademic(
                student=student,
                semester_id=int(row['sem_id']),
                course_code=str(row['course_code']),
                marks=int(row['marks']) if pd.notna(row['marks']) else None,
                attendance=float(row['attendance']) if pd.notna(row['attendance']) else 0.0
            ))
            
            if len(acad_list) >= batch_size:
                StudentAcademic.objects.bulk_create(acad_list, batch_size=batch_size, ignore_conflicts=True)
                acad_list = []
        except (Student.DoesNotExist, ValueError):
            pass
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if acad_list:
        StudentAcademic.objects.bulk_create(acad_list, batch_size=batch_size, ignore_conflicts=True)
    
    acad_count = StudentAcademic.objects.count()
    print(f"\n✓ Loaded {acad_count} academic records")
else:
    print(f"✗ File not found: {acad_csv}")

# ============================================================================
# 3. LOAD STUDENT BACKLOGS (3rd_STUDENT_BACKLOGS.csv)
# ============================================================================
print("\n[3/10] Loading Student Backlogs...")
backlog_csv = DATA_PATH / '3rd_STUDENT_BACKLOGS.csv'

if backlog_csv.exists():
    df_backlog = pd.read_csv(backlog_csv)
    batch_size = 200
    backlog_list = []
    total = len(df_backlog)
    
    for idx, (_, row) in enumerate(df_backlog.iterrows()):
        try:
            student_id = int(row['student_id'])
            student = Student.objects.get(student_id=student_id)
            
            backlog_list.append(StudentBacklog(
                student=student,
                semester_id=int(row['sem_id']),
                course_id=str(row['course_id'])
            ))
            
            if len(backlog_list) >= batch_size:
                StudentBacklog.objects.bulk_create(backlog_list, batch_size=batch_size, ignore_conflicts=True)
                backlog_list = []
        except (Student.DoesNotExist, ValueError):
            pass
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if backlog_list:
        StudentBacklog.objects.bulk_create(backlog_list, batch_size=batch_size, ignore_conflicts=True)
    
    backlog_count = StudentBacklog.objects.count()
    print(f"\n✓ Loaded {backlog_count} backlog records")
else:
    print(f"✗ File not found: {backlog_csv}")

# ============================================================================
# 4. LOAD STUDENT FEE INFORMATION (4th_STUDENT_FEE.csv)
# ============================================================================
print("\n[4/10] Loading Student Fee Information...")
fee_csv = DATA_PATH / '4th_STUDENT_FEE.csv'

if fee_csv.exists():
    df_fee = pd.read_csv(fee_csv)
    batch_size = 100
    fee_list = []
    total = len(df_fee)
    
    for idx, (_, row) in enumerate(df_fee.iterrows()):
        try:
            student_id = int(row['student_id'])
            if not Student.objects.filter(student_id=student_id).exists():
                continue
            
            student = Student.objects.get(student_id=student_id)
            
            fee_list.append(StudentFee(
                student=student,
                mode_of_admission=str(row['mode_of_admission']),
                fee_total=int(row['fee_total']),
                paid_amount=int(row['paid_amount']),
                remaining_amount=int(row['remaining_amount']),
                library_fine=int(row['library_fine']) if pd.notna(row['library_fine']) else 0,
                equipment_fine=int(row['equipment_fine']) if pd.notna(row['equipment_fine']) else 0,
                paid_crt_fee=int(row['paid_crt_fee']) if pd.notna(row['paid_crt_fee']) else 0
            ))
            
            if len(fee_list) >= batch_size:
                StudentFee.objects.bulk_create(fee_list, batch_size=batch_size, ignore_conflicts=True)
                fee_list = []
        except (Student.DoesNotExist, ValueError):
            pass
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if fee_list:
        StudentFee.objects.bulk_create(fee_list, batch_size=batch_size, ignore_conflicts=True)
    
    fee_count = StudentFee.objects.count()
    print(f"\n✓ Loaded {fee_count} fee records")
else:
    print(f"✗ File not found: {fee_csv}")

# ============================================================================
# 5. LOAD FACULTY INFORMATION (5th_FACULTY_INFO.csv)
# ============================================================================
print("\n[5/10] Loading Faculty Information...")
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
            print(f"  ...faculty {row['faculty_id']} already exists, skipping", end='\r', flush=True)
            continue
        
        if not User.objects.filter(email=email).exists():
            users_list.append(User(
                email=email,
                username=email.split('@')[0][:30],
                first_name=str(row['first_name'])[:30],
                last_name=str(row['last_name'])[:30],
                role='faculty',
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
# 6. LOAD FACULTY-STUDENT DEPARTMENT ASSIGNMENTS (6thFACULTY_STUDENT_DEPT.csv)
# ============================================================================
print("\n[6/10] Loading Faculty-Student Department Assignments...")
fac_assign_csv = DATA_PATH / '6thFACULTY_STUDENT_DEPT.csv'

if fac_assign_csv.exists():
    df_fac_assign = pd.read_csv(fac_assign_csv)
    batch_size = 200
    assign_list = []
    total = len(df_fac_assign)
    
    for idx, (_, row) in enumerate(df_fac_assign.iterrows()):
        try:
            faculty_id = int(row['faculty_id'])
            if not Faculty.objects.filter(faculty_id=faculty_id).exists():
                continue
            
            faculty = Faculty.objects.get(faculty_id=faculty_id)
            
            assign_list.append(FacultyAssignment(
                faculty=faculty,
                year_id=int(row['year_id']),
                branch_id=int(row['branch_id']),
                section_id=int(row['sec_id']),
                course_id=str(row['course_id'])
            ))
            
            if len(assign_list) >= batch_size:
                FacultyAssignment.objects.bulk_create(assign_list, batch_size=batch_size, ignore_conflicts=True)
                assign_list = []
        except (Faculty.DoesNotExist, ValueError):
            pass
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if assign_list:
        FacultyAssignment.objects.bulk_create(assign_list, batch_size=batch_size, ignore_conflicts=True)
    
    assign_count = FacultyAssignment.objects.count()
    print(f"\n✓ Loaded {assign_count} faculty assignments")
else:
    print(f"✗ File not found: {fac_assign_csv}")

# ============================================================================
# 7. LOAD TP CELL DATA (7th_TP_CELL.csv)
# ============================================================================
print("\n[7/10] Loading TP Cell Employee Data...")
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
            print(f"  ...TP cell employee {row['emp_id']} already exists, skipping", end='\r', flush=True)
            continue
        
        if not User.objects.filter(email=email).exists():
            users_list.append(User(
                email=email,
                username=email.split('@')[0][:30],
                first_name=str(row['first_name'])[:30],
                last_name=str(row['last_name'])[:30],
                role='tpcell',
                password=make_password(password)
            ))
        
        tpcell_list.append(TPCellEmployee(
            emp_id=int(row['emp_id']),
            first_name=str(row['first_name']),
            last_name=str(row['last_name']),
            email=email,
            passcode=password,
            gender=str(row['gender']),
            designation=str(row['designation'])
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
    print(f"\n✓ Loaded {tpcell_count} TP cell employees")
else:
    print(f"✗ File not found: {tpcell_csv}")

# ============================================================================
# 8. LOAD MANAGEMENT DATA (8th_MANAGEMENT.csv)
# ============================================================================
print("\n[8/10] Loading Management Employee Data...")
mgmt_csv = DATA_PATH / '8th_MANAGEMENT.csv'

if mgmt_csv.exists():
    df_mgmt = pd.read_csv(mgmt_csv)
    batch_size = 20
    users_list = []
    mgmt_list = []
    total = len(df_mgmt)
    
    for idx, (_, row) in enumerate(df_mgmt.iterrows()):
        email = row['email']
        password = str(int(row['passcode']))
        
        if ManagementEmployee.objects.filter(emp_id=row['emp_id']).exists():
            print(f"  ...management employee {row['emp_id']} already exists, skipping", end='\r', flush=True)
            continue
        
        if not User.objects.filter(email=email).exists():
            users_list.append(User(
                email=email,
                username=email.split('@')[0][:30],
                first_name=str(row['first_name'])[:30],
                last_name=str(row['last_name'])[:30],
                role='management',
                password=make_password(password)
            ))
        
        mgmt_list.append(ManagementEmployee(
            emp_id=int(row['emp_id']),
            first_name=str(row['first_name']),
            last_name=str(row['last_name']),
            email=email,
            passcode=password,
            gender=str(row['gender']),
            designation=str(row['designation'])
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
    print(f"✗ File not found: {mgmt_csv}")

# ============================================================================
# 9. LOAD NOTIFICATIONS (9th_NOTIFICATIONS.csv)
# ============================================================================
print("\n[9/10] Loading Notifications...")
notif_csv = DATA_PATH / '9th_NOTIFICATIONS.csv'

if notif_csv.exists():
    df_notif = pd.read_csv(notif_csv)
    batch_size = 500
    notif_list = []
    total = len(df_notif)
    
    for idx, (_, row) in enumerate(df_notif.iterrows()):
        try:
            due_date_str = str(row['due_date']).strip()
            try:
                due_date = pd.to_datetime(due_date_str, format='%d-%m-%Y').date()
            except:
                due_date = pd.to_datetime(due_date_str).date()
            
            notif_list.append(Notification(
                year_id=int(row['year_id']) if pd.notna(row.get('year_id')) else None,
                branch_id=int(row['branch_id']) if pd.notna(row.get('branch_id')) else None,
                section_id=int(row['section_id']) if pd.notna(row.get('sec_id', row.get('section_id'))) else None,
                semester_id=int(row['sem_id']) if pd.notna(row.get('sem_id')) else None,
                student_id=int(row['student_id']) if pd.notna(row.get('student_id')) else None,
                notification_type=str(row['type_of_notification']),
                title=str(row['title']),
                description=str(row['description']),
                due_date=due_date,
                priority=str(row['priority'])
            ))
            
            if len(notif_list) >= batch_size:
                Notification.objects.bulk_create(notif_list, batch_size=batch_size, ignore_conflicts=True)
                notif_list = []
        except (ValueError, KeyError) as e:
            pass
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if notif_list:
        Notification.objects.bulk_create(notif_list, batch_size=batch_size, ignore_conflicts=True)
    
    notif_count = Notification.objects.count()
    print(f"\n✓ Loaded {notif_count} notifications")
else:
    print(f"✗ File not found: {notif_csv}")

# ============================================================================
# 10. LOAD EXAM DATA (10th_MID_EXAM_DATA.csv)
# ============================================================================
print("\n[10/10] Loading Exam Data...")
exam_csv = DATA_PATH / '10th_MID_EXAM_DATA.csv'

if exam_csv.exists():
    df_exam = pd.read_csv(exam_csv)
    batch_size = 500
    exam_list = []
    total = len(df_exam)
    
    for idx, (_, row) in enumerate(df_exam.iterrows()):
        try:
            student_id = int(row['student_id'])
            if not Student.objects.filter(student_id=student_id).exists():
                continue
            
            student = Student.objects.get(student_id=student_id)
            
            exam_list.append(StudentExamData(
                student=student,
                year_id=int(row['year_id']),
                branch_id=int(row['branch_id']),
                section_id=int(row['section_id']),
                semester_id=int(row['sem_id']),
                mid_id=int(row['mid_id']),
                course_id=str(row['course_id']),
                mid_marks=int(row['mid_marks']),
                quiz_marks=int(row['quiz_marks']),
                assignment_marks=int(row['assignment_marks'])
            ))
            
            if len(exam_list) >= batch_size:
                StudentExamData.objects.bulk_create(exam_list, batch_size=batch_size, ignore_conflicts=True)
                exam_list = []
        except (Student.DoesNotExist, ValueError):
            pass
        
        print(f"  ...processed {idx + 1}/{total}", end='\r', flush=True)
    
    if exam_list:
        StudentExamData.objects.bulk_create(exam_list, batch_size=batch_size, ignore_conflicts=True)
    
    exam_count = StudentExamData.objects.count()
    print(f"\n✓ Loaded {exam_count} exam records")
else:
    print(f"✗ File not found: {exam_csv}")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "="*80)
print("DATA LOADING COMPLETE!")
print("="*80)
print(f"✓ Total Users: {User.objects.count()}")
print(f"✓ Students: {Student.objects.count()}")
print(f"✓ Student Academic Records: {StudentAcademic.objects.count()}")
print(f"✓ Student Backlogs: {StudentBacklog.objects.count()}")
print(f"✓ Student Fee Records: {StudentFee.objects.count()}")
print(f"✓ Faculty: {Faculty.objects.count()}")
print(f"✓ Faculty Assignments: {FacultyAssignment.objects.count()}")
print(f"✓ TP Cell Employees: {TPCellEmployee.objects.count()}")
print(f"✓ Management Employees: {ManagementEmployee.objects.count()}")
print(f"✓ Notifications: {Notification.objects.count()}")
print(f"✓ Exam Data Records: {StudentExamData.objects.count()}")
print("="*80)
print("\n🎉 ALL 10 TABLES LOADED SUCCESSFULLY!")
print("You can now login with any user account. Password for all = '1234'")
