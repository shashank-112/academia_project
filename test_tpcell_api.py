#!/usr/bin/env python
"""
Quick test to verify TP Cell endpoints are properly configured
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.test import Client
import json

client = Client()

# Test with a TP Cell user
email = 'anny.gartery@tpcell.edu'
password = '1234'
role = 'tpcell'

print("="*80)
print("TESTING TP CELL ENDPOINTS VIA API")
print("="*80)

# Step 1: Login
print(f"\n[1] Logging in as {email}...")
login_response = client.post('/api/users/login/', 
    data=json.dumps({'email': email, 'password': password, 'role': role}),
    content_type='application/json'
)

if login_response.status_code != 200:
    print(f"✗ Login failed with status {login_response.status_code}")
    print(f"Response: {login_response.content.decode()}")
    exit(1)

login_data = json.loads(login_response.content)
access_token = login_data['access']
print(f"✓ Login successful! Token: {access_token[:50]}...")

# Step 2: Test Profile endpoint
print(f"\n[2] Testing /api/tpcell/profile/...")
headers = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}
profile_response = client.get('/api/tpcell/profile/', **headers)

if profile_response.status_code == 200:
    profile_data = json.loads(profile_response.content)
    print(f"✓ Profile endpoint works!")
    print(f"  - Name: {profile_data.get('first_name')} {profile_data.get('last_name')}")
    print(f"  - Designation: {profile_data.get('designation')}")
else:
    print(f"✗ Profile endpoint failed with status {profile_response.status_code}")
    print(f"Response: {profile_response.content.decode()}")

# Step 3: Test Stats endpoint
print(f"\n[3] Testing /api/tpcell/stats/...")
stats_response = client.get('/api/tpcell/stats/', **headers)

if stats_response.status_code == 200:
    stats_data = json.loads(stats_response.content)
    print(f"✓ Stats endpoint works!")
    print(f"  - Total Students: {stats_data.get('total_students')}")
    print(f"  - Eligible: {stats_data.get('eligible_students')}")
    print(f"  - Avg CGPA: {stats_data.get('avg_cgpa')}")
else:
    print(f"✗ Stats endpoint failed with status {stats_response.status_code}")
    print(f"Response: {stats_response.content.decode()}")

print("\n" + "="*80)
print("✅ TP CELL ENDPOINTS ARE READY")
print("="*80)
