#!/usr/bin/env python
"""
CRITICAL SECURITY: Hash all plain text passcodes in the database
This script should be run ONCE to migrate all existing passcodes from plain text to hashed format
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.contrib.auth.hashers import make_password, check_password
from students.models import Student
from faculty.models import Faculty
from management.models import ManagementEmployee
from tpcell.models import TPCellEmployee

def hash_passwords():
    """Hash all plain text passcodes in all tables"""
    
    print("\n" + "="*80)
    print("SECURITY: HASHING ALL PLAIN TEXT PASSCODES")
    print("="*80)
    
    # Helper function to check if already hashed
    def is_hashed(password_str):
        """Check if password is already hashed (Django hashes start with specific prefixes)"""
        return password_str.startswith(('pbkdf2_sha256$', 'argon2$', 'bcrypt$', 'scrypt$')) if password_str else False
    
    # ==================== STUDENT PASSCODES ====================
    print("\n[1/4] Hashing Student Passcodes...")
    students = Student.objects.all()
    total = students.count()
    hashed_count = 0
    
    for idx, student in enumerate(students):
        if not is_hashed(student.passcode):
            # Hash the plain text passcode
            original = student.passcode
            student.passcode = make_password(original)
            student.save(update_fields=['passcode'])
            hashed_count += 1
        
        if (idx + 1) % 100 == 0 or (idx + 1) == total:
            print(f"  ...processed {idx + 1}/{total} (hashed: {hashed_count})", flush=True)
    
    print(f"✓ Hashed {hashed_count}/{total} student passcodes")
    
    # ==================== FACULTY PASSCODES ====================
    print("\n[2/4] Hashing Faculty Passcodes...")
    faculties = Faculty.objects.all()
    total = faculties.count()
    hashed_count = 0
    
    for idx, faculty in enumerate(faculties):
        if not is_hashed(faculty.passcode):
            original = faculty.passcode
            faculty.passcode = make_password(original)
            faculty.save(update_fields=['passcode'])
            hashed_count += 1
        
        if (idx + 1) % 50 == 0 or (idx + 1) == total:
            print(f"  ...processed {idx + 1}/{total} (hashed: {hashed_count})", flush=True)
    
    print(f"✓ Hashed {hashed_count}/{total} faculty passcodes")
    
    # ==================== MANAGEMENT PASSCODES ====================
    print("\n[3/4] Hashing Management Employee Passcodes...")
    managers = ManagementEmployee.objects.all()
    total = managers.count()
    hashed_count = 0
    
    for idx, manager in enumerate(managers):
        if not is_hashed(manager.passcode):
            original = manager.passcode
            manager.passcode = make_password(original)
            manager.save(update_fields=['passcode'])
            hashed_count += 1
        
        if (idx + 1) % 10 == 0 or (idx + 1) == total:
            print(f"  ...processed {idx + 1}/{total} (hashed: {hashed_count})", flush=True)
    
    print(f"✓ Hashed {hashed_count}/{total} management passcodes")
    
    # ==================== TPCELL PASSCODES ====================
    print("\n[4/4] Hashing TP Cell Employee Passcodes...")
    tpcells = TPCellEmployee.objects.all()
    total = tpcells.count()
    hashed_count = 0
    
    for idx, tpcell in enumerate(tpcells):
        if not is_hashed(tpcell.passcode):
            original = tpcell.passcode
            tpcell.passcode = make_password(original)
            tpcell.save(update_fields=['passcode'])
            hashed_count += 1
        
        if (idx + 1) % 10 == 0 or (idx + 1) == total:
            print(f"  ...processed {idx + 1}/{total} (hashed: {hashed_count})", flush=True)
    
    print(f"✓ Hashed {hashed_count}/{total} TP cell passcodes")
    
    print("\n" + "="*80)
    print("✓ ALL PASSWORDS HASHED SUCCESSFULLY")
    print("="*80)
    print("\nIMPORTANT: Make sure the following are in place:")
    print("  1. ✓ All passcodes in Student table are hashed")
    print("  2. ✓ All passcodes in Faculty table are hashed")
    print("  3. ✓ All passcodes in Management table are hashed")
    print("  4. ✓ All passcodes in TPCell table are hashed")
    print("  5. ✓ Use check_password() for verification instead of == comparison")
    print("  6. ✓ Never store plain text passwords in any response")
    print("\n")

if __name__ == '__main__':
    hash_passwords()
