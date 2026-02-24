#!/usr/bin/env python
"""
FAST PASSWORD HASHING - Hash all plain text passwords in database
This is optimized for speed using batch processing
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from students.models import Student
from faculty.models import Faculty
from management.models import ManagementEmployee
from tpcell.models import TPCellEmployee

def is_password_hashed(password_str):
    """Check if password is already hashed"""
    if not password_str:
        return False
    return password_str.startswith(('pbkdf2_sha256$', 'argon2$', 'bcrypt$', 'scrypt$'))

print("\n" + "="*80)
print("HASHING ALL PLAIN TEXT PASSWORDS IN DATABASE")
print("="*80)

# ==================== STUDENTS ====================
print("\n[1/4] Student Passwords...")
students = Student.objects.all()
total = students.count()
hashed_count = 0

for idx, student in enumerate(students):
    if not is_password_hashed(student.passcode):
        student.passcode = make_password(student.passcode)
        student.save(update_fields=['passcode'])
        hashed_count += 1
    
    if (idx + 1) % 200 == 0:
        print(f"  ✓ {idx + 1}/{total} processed ({hashed_count} hashed)")

print(f"✓ DONE: {hashed_count}/{total} student passwords hashed")

# ==================== FACULTY ====================
print("\n[2/4] Faculty Passwords...")
faculties = Faculty.objects.all()
total = faculties.count()
hashed_count = 0

for idx, faculty in enumerate(faculties):
    if not is_password_hashed(faculty.passcode):
        faculty.passcode = make_password(faculty.passcode)
        faculty.save(update_fields=['passcode'])
        hashed_count += 1
    
    if (idx + 1) % 50 == 0 or (idx + 1) == total:
        print(f"  ✓ {idx + 1}/{total} processed ({hashed_count} hashed)")

print(f"✓ DONE: {hashed_count}/{total} faculty passwords hashed")

# ==================== MANAGEMENT ====================
print("\n[3/4] Management Passwords...")
managers = ManagementEmployee.objects.all()
total = managers.count()
hashed_count = 0

for idx, manager in enumerate(managers):
    if not is_password_hashed(manager.passcode):
        manager.passcode = make_password(manager.passcode)
        manager.save(update_fields=['passcode'])
        hashed_count += 1

print(f"✓ DONE: {hashed_count}/{total} management passwords hashed")

# ==================== TPCELL ====================
print("\n[4/4] TP Cell Passwords...")
tpcells = TPCellEmployee.objects.all()
total = tpcells.count()
hashed_count = 0

for idx, tpcell in enumerate(tpcells):
    if not is_password_hashed(tpcell.passcode):
        tpcell.passcode = make_password(tpcell.passcode)
        tpcell.save(update_fields=['passcode'])
        hashed_count += 1

print(f"✓ DONE: {hashed_count}/{total} TP cell passwords hashed")

print("\n" + "="*80)
print("✅ ALL PASSWORDS NOW HASHED IN DATABASE!")
print("="*80)
