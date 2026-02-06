#!/usr/bin/env python
"""
Test login API endpoint
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.test import Client

client = Client()

payload = {
    'email': '1ycsea1@college.edu',
    'password': '1234',
    'role': 'student'
}

print("Testing login endpoint...")
print(f"Payload: {json.dumps(payload, indent=2)}")

response = client.post('/api/users/login/', 
                       data=json.dumps(payload),
                       content_type='application/json')

print(f"\nStatus Code: {response.status_code}")
print(f"Response: {response.content.decode()}")

if response.status_code == 200:
    data = json.loads(response.content)
    print(f"\n✓ LOGIN SUCCESSFUL!")
    print(f"Access Token: {data['access'][:50]}...")
    print(f"User: {data['user']['email']} ({data['user']['role']})")
else:
    print(f"\n✗ LOGIN FAILED")
    print(response.json())
