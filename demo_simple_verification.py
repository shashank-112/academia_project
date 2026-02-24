#!/usr/bin/env python
"""
DEMO: Hash Verification (Standalone - No Django needed)
Shows why hashes CANNOT be reversed and how to verify passwords
"""

import hashlib
import os
import base64
import hmac

print("\n" + "="*80)
print("DEMO: HASH VERIFICATION (Why Hashes Can't Be Reversed)")
print("="*80)

print("\n⚠️  THE TRUTH ABOUT HASHES:")
print("="*80)
print("\n❌ HASHES CANNOT BE REVERSED")
print("   - If someone steals your hash, they can't get the password")
print("   - Like a one-way street")
print("   - Or crushing an egg - you can't un-crush it")
print("\n✅ WHAT YOU CAN DO:")
print("   - Guess the password and hash it")
print("   - Compare the new hash with the stolen one")
print("   - If they match → you had the correct password!")

print("\n" + "="*80)

def simple_verify(password, hash_str):
    """Simple verification using SHA256"""
    computed_hash = hashlib.sha256(password.encode()).hexdigest()
    return computed_hash == hash_str

def secure_verify(password, stored_hash):
    """Secure verification using PBKDF2"""
    try:
        parts = stored_hash.split('$')
        if len(parts) != 4:
            return False
        
        algorithm, iterations, salt_b64, hash_b64 = parts
        iterations = int(iterations)
        
        salt = base64.b64decode(salt_b64)
        stored_pwd_hash = base64.b64decode(hash_b64)
        
        # Compute hash of input password with same salt
        computed_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode(),
            salt,
            iterations
        )
        
        # Secure comparison (prevents timing attacks)
        return hmac.compare_digest(computed_hash, stored_pwd_hash)
    except:
        return False

print("\n🎮 INTERACTIVE DEMO:")
print("="*80)

# Example: Create and verify
example_password = "SuperSecret123"

print(f"\n1️⃣  User creates a password: '{example_password}'")
stored_hash = hashlib.sha256(example_password.encode()).hexdigest()
print(f"\n2️⃣  We hash it and store in database:")
print(f"    {stored_hash}")

print(f"\n3️⃣  User tries to login with different passwords:\n")

test_cases = [
    ("SuperSecret123", "✅ Correct!"),
    ("supersecret123", "❌ Different case!"),
    ("SuperSecret124", "❌ One character different!"),
    ("password", "❌ Completely wrong!"),
]

for test_pwd, description in test_cases:
    is_correct = simple_verify(test_pwd, stored_hash)
    result = "✅ MATCH" if is_correct else "❌ NO MATCH"
    print(f"   '{test_pwd}' → {result}  {description}")

print("\n" + "="*80)
print("\n🧪 NOW YOU TRY:")
print("="*80)

while True:
    print("\n1️⃣  Create and store a password:\n")
    password = input("   Enter password: ").strip()
    
    if not password:
        print("   ❌ Empty!")
        continue
    
    # Create hash
    created_hash = hashlib.sha256(password.encode()).hexdigest()
    
    print(f"\n   ✅ Hash created and stored:")
    print(f"      {created_hash}\n")
    
    # Verify attempts
    print(f"\n2️⃣  Test login attempts:\n")
    
    while True:
        attempt = input("   Password attempt (or 'new' for new password): ").strip()
        
        if attempt.lower() == 'new':
            break
        
        if not attempt:
            print("   ❌ Empty!")
            continue
        
        is_correct = simple_verify(attempt, created_hash)
        
        if is_correct:
            print(f"   ✅ CORRECT! '{attempt}' matches!")
            print(f"      → LOGIN SUCCESSFUL\n")
        else:
            print(f"   ❌ WRONG! '{attempt}' doesn't match!")
            print(f"      → LOGIN FAILED\n")
    
    retry = input("\nTry another? (yes/no): ").strip().lower()
    if retry not in ['yes', 'y']:
        break

print("\n" + "="*80)
print("📚 WHAT YOU LEARNED:")
print("="*80)
print("\n✅ Hashes are ONE-WAY")
print("✅ Hash(a) ≠ Hash(b) if a ≠ b")
print("✅ Same password can produce different hashes (salt)")
print("✅ To verify: hash the input and compare")
print("✅ Impossible to reverse even if someone gets the hash")
print("✅ This is why hackers steal passwords from plain text")
print("✅ But can't recover them from hashes\n")
print("="*80 + "\n")
