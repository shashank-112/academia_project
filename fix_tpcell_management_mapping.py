#!/usr/bin/env python
"""
Fix TP Cell & Management User ID Mapping
Ensures all TP Cell and Management employees have correct user_id linking
Uses role-based ID ranges to avoid conflicts:
- Students: ID 1-1000
- Faculty: ID 1-52 (already assigned)
- TP Cell: ID 10000-10999
- Management: ID 20000-20999
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from users.models import User
from tpcell.models import TPCellEmployee
from management.models import ManagementEmployee

print("="*80)
print("FIXING TP CELL & MANAGEMENT USER ID MAPPING")
print("="*80)

# ============================================================================
# 1. Fix TP Cell Employee User Records
# ============================================================================
print("\n[1/2] Fixing TP Cell Employee User ID Mapping...")
tpcell_count = TPCellEmployee.objects.count()
print(f"Total TP Cell Employees in database: {tpcell_count}")

tpcell_fixed = 0

# First cleanup duplicates
for emp_id in TPCellEmployee.objects.all().values_list('emp_id', flat=True):
    emp = TPCellEmployee.objects.get(emp_id=emp_id)
    users = User.objects.filter(email=emp.email, role='tpcell')
    if users.count() > 1:
        first_user = users.first()
        users.exclude(id=first_user.id).delete()
        print(f"  ⚠ Cleaned up duplicate users for {emp.email}")

# Now fix mappings with offset IDs
for idx, emp in enumerate(TPCellEmployee.objects.all(), start=1):
    users = User.objects.filter(email=emp.email, role='tpcell')
    tpcell_user_id = 10000 + idx  # Use 10000+ range for TP Cell
    
    if users.exists():
        user = users.first()
        if user.user_id is None or user.user_id != tpcell_user_id:
            # Clear any conflicting IDs first
            conflicting = User.objects.filter(user_id=tpcell_user_id).exclude(id=user.id)
            if conflicting.exists():
                conflicting.update(user_id=None)
            
            user.user_id = tpcell_user_id
            user.save()
            tpcell_fixed += 1
            print(f"  ✓ Fixed {emp.email}: user_id={tpcell_user_id}")
    else:
        user = User.objects.create_user(
            email=emp.email,
            username=emp.email.split('@')[0][:30],
            first_name=emp.first_name[:30],
            last_name=emp.last_name[:30],
            password=emp.passcode,
            role='tpcell',
            user_id=tpcell_user_id
        )
        tpcell_fixed += 1
        print(f"  ✓ Created {emp.email}: user_id={tpcell_user_id}")

print(f"\n✓ Fixed/Created {tpcell_fixed} TP Cell user mappings")

# ============================================================================
# 2. Fix Management Employee User Records
# ============================================================================
print("\n[2/2] Fixing Management Employee User ID Mapping...")
mgmt_count = ManagementEmployee.objects.count()
print(f"Total Management Employees in database: {mgmt_count}")

mgmt_fixed = 0

# First cleanup duplicates
for emp_id in ManagementEmployee.objects.all().values_list('emp_id', flat=True):
    emp = ManagementEmployee.objects.get(emp_id=emp_id)
    users = User.objects.filter(email=emp.email, role='management')
    if users.count() > 1:
        first_user = users.first()
        users.exclude(id=first_user.id).delete()
        print(f"  ⚠ Cleaned up duplicate users for {emp.email}")

# Now fix mappings with offset IDs
for idx, emp in enumerate(ManagementEmployee.objects.all(), start=1):
    users = User.objects.filter(email=emp.email, role='management')
    mgmt_user_id = 20000 + idx  # Use 20000+ range for Management
    
    if users.exists():
        user = users.first()
        if user.user_id is None or user.user_id != mgmt_user_id:
            # Clear any conflicting IDs first
            conflicting = User.objects.filter(user_id=mgmt_user_id).exclude(id=user.id)
            if conflicting.exists():
                conflicting.update(user_id=None)
            
            user.user_id = mgmt_user_id
            user.save()
            mgmt_fixed += 1
            print(f"  ✓ Fixed {emp.email}: user_id={mgmt_user_id}")
    else:
        user = User.objects.create_user(
            email=emp.email,
            username=emp.email.split('@')[0][:30],
            first_name=emp.first_name[:30],
            last_name=emp.last_name[:30],
            password=emp.passcode,
            role='management',
            user_id=mgmt_user_id
        )
        mgmt_fixed += 1
        print(f"  ✓ Created {emp.email}: user_id={mgmt_user_id}")

print(f"\n✓ Fixed/Created {mgmt_fixed} Management user mappings")

# ============================================================================
# Verify
# ============================================================================
print("\n" + "="*80)
print("✅ TP CELL & MANAGEMENT MAPPING COMPLETE!")
print("="*80)

# Show sample users
print("\nSample TP Cell users to test:")
count = 0
for user in User.objects.filter(role='tpcell')[:2]:
    print(f"  - {user.email}")
    count += 1

print("\nSample Management users to test:")
count = 0
for user in User.objects.filter(role='management')[:2]:
    print(f"  - {user.email}")
    count += 1

print("\nAll user_id mappings are now fixed!")
print("Restart Django server and test the TP Cell and Management dashboards.")
