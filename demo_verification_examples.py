#!/usr/bin/env python
"""
DEMO: Hash Verification (Non-interactive - Shows examples)
"""

import hashlib

print("\n" + "="*80)
print("🎓 DEMO: PASSWORD VERIFICATION WITH HASHES")
print("="*80)

print("\n💡 KEY CONCEPT:")
print("-" * 80)
print("\n❌ HASHES CANNOT BE REVERSED")
print("   Once hashed, you cannot get the original password back")
print("\n✅ INSTEAD: We VERIFY by comparing hashes")
print("   1. User enters password")
print("   2. We hash their input")
print("   3. Compare with stored hash")
print("   4. If same → Correct password!")

print("\n\n📚 EXAMPLE: User Login Verification")
print("="*80)

# Simulate database storing a hash
original_password = "MySecurePass456"
stored_hash = hashlib.sha256(original_password.encode()).hexdigest()

print(f"\n1️⃣  User creates account with password: '{original_password}'")
print(f"\n2️⃣  We hash and store in database:")
print(f"    HASH: {stored_hash}")

print(f"\n3️⃣  Later, user tries to login with different passwords:")
print("-" * 80)

test_attempts = [
    ("MySecurePass456", True),
    ("mysecurepass456", False),
    ("MySecurePass457", False),
    ("password", False),
    ("123456", False),
    ("MySecurePass456", True),
]

for idx, (attempt_password, should_match) in enumerate(test_attempts, 1):
    attempt_hash = hashlib.sha256(attempt_password.encode()).hexdigest()
    is_match = attempt_hash == stored_hash
    
    print(f"\n   Attempt #{idx}: '{attempt_password}'")
    print(f"   Their hash:  {attempt_hash[:50]}...")
    print(f"   Stored hash: {stored_hash[:50]}...")
    
    if is_match:
        print(f"   ✅ MATCH! Login SUCCESSFUL")
    else:
        print(f"   ❌ NO MATCH! Login FAILED")

print("\n\n" + "="*80)
print("🔐 WHY THIS IS SECURE")
print("="*80)

print("\n📋 Scenario: Hacker steals the database")
print("-" * 80)
print(f"\n Hacker gets: {stored_hash}")
print(f"\n Can they reverse it to get: '{original_password}'? ❌ NO!")
print(f"\n Why? Because hashing is ONE-WAY")
print(f"\n What can they do?")
print(f"  1. Try to guess passwords (SLOW - 600,000 iterations)")
print(f"  2. Use rainbow tables (BLOCKED - salt makes unique)")
print(f"  3. Use GPU attacks (HARD - PBKDF2 is designed for this)")

print("\n\n" + "="*80)
print("📊 COMPARISON: Plain Text vs Hashed")
print("="*80)

print("\n❌ PLAIN TEXT (INSECURE):")
print("   Database: password = '1234'")
print("   Problem:  Hacker sees password immediately!")

print("\n✅ HASHED (SECURE):")
print("   Database: password = 'pbkdf2_sha256$600000$...'")
print("   Problem:  Hacker needs millions of years to crack!")

print("\n\n" + "="*80)
print("📝 KEY TAKEAWAYS")
print("="*80)
print("""
✅ Hash(a) ≠ Hash(b) if a ≠ b

✅ Hash('password') ≠ 'password'
   (Cannot reverse)

✅ Hash('pass') + Hash('pass') = Different hashes
   (Due to salt)

✅ To verify: Hash(input) == Hash(stored)
   (Simple comparison)

✅ Hashing = Security Best Practice
   (Use PBKDF2, Argon2, or bcrypt)
""")

print("="*80 + "\n")
