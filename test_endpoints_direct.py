#!/usr/bin/env python
"""
Test if the API endpoints are accessible via HTTP test client
This simulates what the browser would do
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.test import Client

client = Client()

print("="*80)
print("TESTING API ENDPOINTS DIRECTLY")
print("="*80)

# Step 1: Login
email = 'anny.gartery@tpcell.edu'
password = '1234'
role = 'tpcell'

print(f"\n[1] POST /api/users/login/ with email={email}")
login_resp = client.post('/api/users/login/', 
    data=json.dumps({'email': email, 'password': password, 'role': role}),
    content_type='application/json'
)
print(f"Status: {login_resp.status_code}")
if login_resp.status_code == 200:
    print("✓ Login works")
    login_data = json.loads(login_resp.content)
    token = login_data['access']
else:
    print(f"✗ Login failed: {login_resp.content.decode()}")
    exit(1)

# Step 2: Test profile endpoint
print(f"\n[2] GET /api/tpcell/profile/ with auth token")
headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
profile_resp = client.get('/api/tpcell/profile/', **headers)
print(f"Status: {profile_resp.status_code}")
if profile_resp.status_code == 200:
    print("✓ Profile endpoint works")
    print(f"Response: {profile_resp.content.decode()[:200]}")
elif profile_resp.status_code == 404:
    print(f"✗ 404 Not Found - URL pattern issue")
    print(f"Response: {profile_resp.content.decode()}")
else:
    print(f"✗ Error: {profile_resp.status_code}")
    print(f"Response: {profile_resp.content.decode()}")

# Step 3: Test stats endpoint
print(f"\n[3] GET /api/tpcell/stats/ with auth token")
stats_resp = client.get('/api/tpcell/stats/', **headers)
print(f"Status: {stats_resp.status_code}")
if stats_resp.status_code == 200:
    print("✓ Stats endpoint works")
    print(f"Response: {stats_resp.content.decode()[:200]}")
elif stats_resp.status_code == 404:
    print(f"✗ 404 Not Found - URL pattern issue")
    print(f"Response: {stats_resp.content.decode()}")
elif stats_resp.status_code == 500:
    print(f"✗ 500 Internal Server Error")
    print(f"Response: {stats_resp.content.decode()}")
else:
    print(f"✗ Error: {stats_resp.status_code}")
    print(f"Response: {stats_resp.content.decode()}")

print("\n" + "="*80)
print("TEST COMPLETE")
print("="*80)
