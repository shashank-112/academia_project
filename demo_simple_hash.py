#!/usr/bin/env python
"""
DEMO: Plain Text to Cipher Text (Standalone - No Django needed)
Shows password hashing using Python's hashlib
"""

import hashlib
import os
import base64

print("\n" + "="*80)
print("DEMO: PLAIN TEXT → CIPHER TEXT (NO DJANGO NEEDED)")
print("="*80)

def simple_hash(password):
    """Simple hash using SHA256 (for demo only - NOT for production!)"""
    return hashlib.sha256(password.encode()).hexdigest()

def pbkdf2_hash(password, iterations=100000):
    """PBKDF2 hash (similar to what Django uses)"""
    salt = os.urandom(32)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, iterations)
    # Return: salt + hash (separated by $)
    salt_b64 = base64.b64encode(salt).decode()
    hash_b64 = base64.b64encode(pwd_hash).decode()
    return f"pbkdf2_sha256${iterations}${salt_b64}${hash_b64}"

print("\nMethod 1: Simple SHA256 Hash (NOT SECURE - For demo only)")
print("-" * 80)
password1 = "hello123"
hash1 = simple_hash(password1)
print(f"Plain Text: {password1}")
print(f"Hash:       {hash1}")

print("\n\nMethod 2: PBKDF2 Hash (MORE SECURE - Like Django uses)")
print("-" * 80)
password2 = "hello123"
hash2 = pbkdf2_hash(password2)
print(f"Plain Text: {password2}")
print(f"Hash:       {hash2}")

print("\n\nNow try yourself:")
print("=" * 80)

while True:
    plain = input("\n📝 Enter password to hash (or 'exit' to quit): ").strip()
    
    if plain.lower() == 'exit':
        break
    
    if not plain:
        print("❌ Empty input!")
        continue
    
    print(f"\n✅ Plain Text Input:")
    print(f"   '{plain}'")
    
    print(f"\n📊 SHA256 Hash:")
    print(f"   {simple_hash(plain)}\n")
    
    print(f"📊 PBKDF2 Hash (More Secure):")
    print(f"   {pbkdf2_hash(plain)}\n")
    
    print("💡 Notice:")
    print("   - Two hashes look completely different")
    print("   - Same password = Different hashes (due to salt)")
    print("   - Cannot convert back to plain text")
    print("   - This is the entire point of hashing!")

print("\n" + "="*80 + "\n")
