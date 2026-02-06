#!/usr/bin/env python
"""
Comprehensive password fix - directly hash all passwords from their passcode values
"""
import os
import django
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.db import connection
from users.models import User

print("="*80)
print("COMPREHENSIVE PASSWORD FIX")
print("="*80)

# Get all users
all_users = User.objects.all()
total = all_users.count()

print(f"\nProcessing {total} users...")

users_to_update = []
batch_size = 100
processed = 0

for user in all_users:
    # Use email as password (as per CSV format - all users have password '1234')
    # The email's numeric prefix is the original passcode
    password = '1234'
    
    # Hash the password
    hashed_password = make_password(password)
    
    user.password = hashed_password
    users_to_update.append(user)
    processed += 1
    
    if len(users_to_update) >= batch_size:
        User.objects.bulk_update(users_to_update, ['password'], batch_size=batch_size)
        users_to_update = []
        print(f"  ...processed {processed}/{total}", end='\r', flush=True)

# Update remaining users
if users_to_update:
    User.objects.bulk_update(users_to_update, ['password'], batch_size=batch_size)

print(f"\n✓ Fixed all {processed} user passwords")
print("\n" + "="*80)
print("PASSWORD FIX COMPLETE!")
print("="*80)
print(f"All {total} users now have password: '1234'")
print("Try logging in now!")
