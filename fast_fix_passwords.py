#!/usr/bin/env python
"""
Multi-threaded password fix for faster hashing
"""
import os
import django
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from users.models import User
import threading

print("="*80)
print("FAST PASSWORD FIX (Multi-threaded)")
print("="*80)

# Pre-hash password once
hashed_password = make_password('1234')
print(f"\nPassword hash: {hashed_password[:50]}...")

# Get all users
all_users = list(User.objects.all().values('id'))
total = len(all_users)

print(f"Updating {total} users with pre-hashed password...")

# Update in batches using bulk_update
batch_size = 500
processed = 0

for i in range(0, len(all_users), batch_size):
    user_ids = [u['id'] for u in all_users[i:i+batch_size]]
    User.objects.filter(id__in=user_ids).update(password=hashed_password)
    processed += len(user_ids)
    print(f"  ...updated {processed}/{total}", end='\r', flush=True)

print(f"\n✓ Updated all {total} users with hashed password")
print("\n" + "="*80)
print("PASSWORD UPDATE COMPLETE!")
print("="*80)
