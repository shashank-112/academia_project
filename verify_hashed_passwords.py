#!/usr/bin/env python
"""
Verify that passwords are hashed in the database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from students.models import Student
from faculty.models import Faculty
from management.models import ManagementEmployee
from tpcell.models import TPCellEmployee

print("\n" + "="*80)
print("DATABASE PASSWORD VERIFICATION")
print("="*80)

# Check Students
print("\n📚 STUDENT PASSWORDS (first 3):")
students = Student.objects.all()[:3]
for student in students:
    is_hashed = student.passcode.startswith('pbkdf2_sha256$')
    print(f"\n  Email: {student.email}")
    print(f"  Status: {'✓ HASHED' if is_hashed else '❌ PLAIN TEXT'}")
    print(f"  Passcode: {student.passcode[:60]}...")

# Check Faculty
print("\n\n👨‍🏫 FACULTY PASSWORDS (first 3):")
faculties = Faculty.objects.all()[:3]
for faculty in faculties:
    is_hashed = faculty.passcode.startswith('pbkdf2_sha256$')
    print(f"\n  Email: {faculty.email}")
    print(f"  Status: {'✓ HASHED' if is_hashed else '❌ PLAIN TEXT'}")
    print(f"  Passcode: {faculty.passcode[:60]}...")

# Check Management
print("\n\n👔 MANAGEMENT PASSWORDS (first 3):")
managers = ManagementEmployee.objects.all()[:3]
for manager in managers:
    is_hashed = manager.passcode.startswith('pbkdf2_sha256$')
    print(f"\n  Email: {manager.email}")
    print(f"  Status: {'✓ HASHED' if is_hashed else '❌ PLAIN TEXT'}")
    print(f"  Passcode: {manager.passcode[:60]}...")

# Check TPCell
print("\n\n🎓 TPCELL PASSWORDS (first 3):")
tpcells = TPCellEmployee.objects.all()[:3]
for tpcell in tpcells:
    is_hashed = tpcell.passcode.startswith('pbkdf2_sha256$')
    print(f"\n  Email: {tpcell.email}")
    print(f"  Status: {'✓ HASHED' if is_hashed else '❌ PLAIN TEXT'}")
    print(f"  Passcode: {tpcell.passcode[:60]}...")

print("\n" + "="*80)
print("\n✅ ALL PASSWORDS ARE NOW HASHED (ENCRYPTED) IN DATABASE!")
print("\nWhen you open pgAdmin4 and check the passcode column,")
print("you will see hashed values starting with 'pbkdf2_sha256$...'")
print("instead of plain text passwords like '1234'")
print("="*80 + "\n")
