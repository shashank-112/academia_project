#!/usr/bin/env python
"""
Quick hash for remaining passwords (Faculty, Management, TPCell)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from faculty.models import Faculty
from management.models import ManagementEmployee
from tpcell.models import TPCellEmployee

def is_hashed(p):
    return p.startswith('pbkdf2_sha256$') if p else False

print("\nHASHING REMAINING PASSWORDS...\n")

# Faculty
print("[1/3] Faculty...")
for faculty in Faculty.objects.all():
    if not is_hashed(faculty.passcode):
        faculty.passcode = make_password(faculty.passcode)
        faculty.save(update_fields=['passcode'])
print(f"✓ Faculty done")

# Management
print("[2/3] Management...")
for manager in ManagementEmployee.objects.all():
    if not is_hashed(manager.passcode):
        manager.passcode = make_password(manager.passcode)
        manager.save(update_fields=['passcode'])
print(f"✓ Management done")

# TPCell
print("[3/3] TP Cell...")
for tpcell in TPCellEmployee.objects.all():
    if not is_hashed(tpcell.passcode):
        tpcell.passcode = make_password(tpcell.passcode)
        tpcell.save(update_fields=['passcode'])
print(f"✓ TP Cell done")

print("\n✅ ALL PASSWORDS HASHED AND SAVED TO DATABASE!\n")
