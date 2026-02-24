#!/usr/bin/env python
"""
Load attendance data from CSV into StudentAttendance model
"""
import os
import django
import pandas as pd
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from students.models import Student, StudentAttendance

DATA_PATH = Path(__file__).parent.parent / 'data'
print(f"[*] Data path: {DATA_PATH}")

print("="*80)
print("LOADING ATTENDANCE DATA INTO DATABASE")
print("="*80)

attendance_csv = DATA_PATH / '11th_STUDENT_ATTENDANCE.csv'

if attendance_csv.exists():
    df = pd.read_csv(attendance_csv)
    print(f"\n[*] Found {len(df)} attendance records in CSV")
    
    batch_size = 100
    created_count = 0
    updated_count = 0
    error_count = 0
    
    for idx, (_, row) in enumerate(df.iterrows()):
        try:
            student_id = int(row['student_id'])
            
            # Get student
            student = Student.objects.filter(student_id=student_id).first()
            if not student:
                error_count += 1
                continue
            
            # Extract class records (columns 1-50)
            class_records = []
            for col in range(1, 51):
                col_name = str(col)
                if col_name in row.index:
                    val = row[col_name]
                    # Handle NaN/empty values
                    if pd.isna(val) or val == '':
                        class_records.append(None)
                    else:
                        class_records.append(int(val))
                else:
                    class_records.append(None)
            
            # Create or update attendance record
            attendance, created = StudentAttendance.objects.update_or_create(
                student=student,
                semester_id=int(row['sem_id']),
                course_id=row['course_id'],
                defaults={
                    'year_id': int(row['year_id']),
                    'branch_id': int(row['branch_id']),
                    'section_id': int(row['sec_id']),
                    'class_records': class_records,
                }
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1
            
            # Print progress
            if (idx + 1) % batch_size == 0:
                print(f"[{idx + 1}/{len(df)}] Processed - Created: {created_count}, Updated: {updated_count}, Errors: {error_count}")
        
        except Exception as e:
            error_count += 1
            print(f"[ERROR] Row {idx}: {str(e)}")
    
    print("\n" + "="*80)
    print(f"ATTENDANCE DATA LOADING COMPLETE")
    print(f"Created: {created_count} | Updated: {updated_count} | Errors: {error_count}")
    print("="*80)
    
else:
    print(f"\n[ERROR] CSV file not found: {attendance_csv}")
