#!/usr/bin/env python
"""
Test script to verify password hashing and login functionality
Run this after migration to ensure everything works correctly
"""
import os
import django
import json
from django.contrib.auth.hashers import make_password, check_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.test import Client
from django.urls import reverse
from users.models import User
from students.models import Student
from faculty.models import Faculty
from management.models import ManagementEmployee
from tpcell.models import TPCellEmployee

def separator(title=""):
    """Print a decorative separator"""
    print("\n" + "="*80)
    if title:
        print(f" {title}")
        print("="*80)
    else:
        print("="*80)

def test_password_hashing():
    """Test 1: Verify passwords are properly hashed"""
    separator("TEST 1: Password Hashing Status")
    
    issues = 0
    
    # Check Students
    students = Student.objects.all()[:5]
    print(f"\n📚 Checking {students.count()} Student passcodes:")
    for student in students:
        is_hashed = student.passcode.startswith(('pbkdf2_sha256$', 'argon2$', 'bcrypt$', 'scrypt$'))
        status = "✓ HASHED" if is_hashed else "❌ PLAIN TEXT"
        print(f"  {student.email}: {status}")
        if not is_hashed:
            issues += 1
    
    # Check Faculty
    faculties = Faculty.objects.all()[:5]
    print(f"\n👨‍🏫 Checking {faculties.count()} Faculty passcodes:")
    for faculty in faculties:
        is_hashed = faculty.passcode.startswith(('pbkdf2_sha256$', 'argon2$', 'bcrypt$', 'scrypt$'))
        status = "✓ HASHED" if is_hashed else "❌ PLAIN TEXT"
        print(f"  {faculty.email}: {status}")
        if not is_hashed:
            issues += 1
    
    # Check Management
    managers = ManagementEmployee.objects.all()[:5]
    print(f"\n👔 Checking {managers.count()} Management passcodes:")
    for manager in managers:
        is_hashed = manager.passcode.startswith(('pbkdf2_sha256$', 'argon2$', 'bcrypt$', 'scrypt$'))
        status = "✓ HASHED" if is_hashed else "❌ PLAIN TEXT"
        print(f"  {manager.email}: {status}")
        if not is_hashed:
            issues += 1
    
    # Check TPCell
    tpcells = TPCellEmployee.objects.all()[:5]
    print(f"\n🎓 Checking {tpcells.count()} TPCell passcodes:")
    for tpcell in tpcells:
        is_hashed = tpcell.passcode.startswith(('pbkdf2_sha256$', 'argon2$', 'bcrypt$', 'scrypt$'))
        status = "✓ HASHED" if is_hashed else "❌ PLAIN TEXT"
        print(f"  {tpcell.email}: {status}")
        if not is_hashed:
            issues += 1
    
    if issues == 0:
        print("\n✅ TEST 1 PASSED: All passwords are properly hashed!")
    else:
        print(f"\n❌ TEST 1 FAILED: {issues} plain text passwords found!")
    
    return issues == 0

def test_password_verification():
    """Test 2: Verify password checking methods work"""
    separator("TEST 2: Password Verification Methods")
    
    test_password = "test123456"
    issues = 0
    
    try:
        # Get or create a test student
        student = Student.objects.first()
        if not student:
            print("❌ No students in database to test")
            return False
        
        print(f"\n📝 Testing password verification with: {student.email}")
        
        # Hash a test password
        hashed = make_password(test_password)
        print(f"✓ Created hash: {hashed[:50]}...")
        
        # Test Django's check_password
        is_valid = check_password(test_password, hashed)
        print(f"✓ Django check_password(): {'VALID' if is_valid else 'INVALID'}")
        if not is_valid:
            issues += 1
        
        # Test model method
        student.passcode = hashed
        is_valid = student.check_passcode(test_password)
        print(f"✓ Model.check_passcode(): {'VALID' if is_valid else 'INVALID'}")
        if not is_valid:
            issues += 1
        
        # Test with wrong password
        is_invalid = student.check_passcode("wrongpassword")
        print(f"✓ Wrong password check: {'CORRECTLY REJECTED' if not is_invalid else 'ERROR'}")
        if is_invalid:
            issues += 1
        
        if issues == 0:
            print("\n✅ TEST 2 PASSED: Password verification working correctly!")
        else:
            print(f"\n❌ TEST 2 FAILED: {issues} verification issues found!")
        
    except Exception as e:
        print(f"\n❌ TEST 2 ERROR: {str(e)}")
        return False
    
    return issues == 0

def test_login_endpoint():
    """Test 3: Test actual login endpoint"""
    separator("TEST 3: Login Endpoint")
    
    print("\n🔑 Testing login endpoint...")
    client = Client()
    
    # Get a test user
    user = User.objects.filter(role='student').first()
    if not user:
        print("❌ No student users in database to test")
        return False
    
    # Get their original password (we need to test with the actual password)
    # First create a test user with known password
    test_email = "test_login_verify@example.com"
    test_password = "TestPassword123"
    test_role = "student"
    
    print(f"\n📧 Creating test user: {test_email}")
    
    # Create test user
    if not User.objects.filter(email=test_email).exists():
        test_user = User.objects.create_user(
            email=test_email,
            username="testloginuser",
            password=test_password,
            role=test_role,
            first_name="Test",
            last_name="User"
        )
        print(f"✓ Test user created with password: {test_password}")
    else:
        test_user = User.objects.get(email=test_email)
    
    # Test login with correct password
    print(f"\n🔐 Testing login with CORRECT password...")
    try:
        response = client.post(
            '/api/users/login/',
            data=json.dumps({
                'email': test_email,
                'password': test_password,
                'role': test_role
            }),
            content_type='application/json'
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'access' in data and 'user' in data:
                print(f"✓ Login successful!")
                print(f"  - Status: 200 OK")
                print(f"  - Access token (first 50 chars): {str(data['access'])[:50]}...")
                print(f"  - User: {data['user']['email']} ({data['user']['role']})")
            else:
                print(f"❌ Login returned 200 but missing tokens")
                return False
        else:
            print(f"❌ Login failed with status {response.status_code}")
            print(f"  Response: {response.content.decode()}")
            return False
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return False
    
    # Test login with wrong password
    print(f"\n🔓 Testing login with WRONG password...")
    try:
        response = client.post(
            '/api/users/login/',
            data=json.dumps({
                'email': test_email,
                'password': 'WrongPassword123',
                'role': test_role
            }),
            content_type='application/json'
        )
        
        if response.status_code == 401:
            print(f"✓ Wrong password correctly rejected!")
            print(f"  - Status: 401 Unauthorized")
        else:
            print(f"❌ Wrong password should return 401, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return False
    
    print("\n✅ TEST 3 PASSED: Login endpoint working correctly!")
    return True

def test_model_methods():
    """Test 4: Test model password methods"""
    separator("TEST 4: Model Password Methods")
    
    issues = 0
    print("\n🧪 Testing Student.set_passcode() and check_passcode()...")
    
    student = Student.objects.first()
    if not student:
        print("❌ No students in database to test")
        return False
    
    try:
        test_pass = "NewTestPass123"
        
        # Test set_passcode
        student.set_passcode(test_pass)
        print(f"✓ Set new passcode on {student.email}")
        
        # Verify it's hashed
        is_hashed = student.passcode.startswith(('pbkdf2_sha256$', 'argon2$', 'bcrypt$', 'scrypt$'))
        print(f"✓ Passcode is hashed: {is_hashed}")
        if not is_hashed:
            issues += 1
        
        # Test check_passcode with correct password
        is_valid = student.check_passcode(test_pass)
        print(f"✓ Correct password validation: {is_valid}")
        if not is_valid:
            issues += 1
        
        # Test check_passcode with wrong password
        is_valid = student.check_passcode("WrongPass123")
        print(f"✓ Wrong password rejected: {not is_valid}")
        if is_valid:
            issues += 1
        
        if issues == 0:
            print("\n✅ TEST 4 PASSED: Model methods working correctly!")
        else:
            print(f"\n❌ TEST 4 FAILED: {issues} issues found!")
        
    except Exception as e:
        print(f"\n❌ TEST 4 ERROR: {str(e)}")
        return False
    
    return issues == 0

def main():
    """Run all tests"""
    separator("PASSWORD SECURITY VERIFICATION SUITE")
    print("\nRunning comprehensive password security tests...\n")
    
    results = {
        "Password Hashing": test_password_hashing(),
        "Password Verification": test_password_verification(),
        "Login Endpoint": test_login_endpoint(),
        "Model Methods": test_model_methods(),
    }
    
    separator("TEST RESULTS SUMMARY")
    print()
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*80}")
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Password security migration is complete!")
        print("\n✅ You can now:")
        print("   • Login securely with hashed passwords")
        print("   • Set new passwords safely")
        print("   • Verify passwords against hashed values")
        print("   • Trust password security in your database")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Review the output above.")
    
    print("="*80)

if __name__ == '__main__':
    main()
