#!/usr/bin/env python
"""
DEMO: Plain Text → Cipher Text (Non-interactive version - Shows examples)
"""

import hashlib
import os
import base64

print("\n" + "="*80)
print("🎓 DEMO: PLAIN TEXT TO CIPHER TEXT CONVERSION")
print("="*80)

def simple_hash(password):
    """SHA256 hash"""
    return hashlib.sha256(password.encode()).hexdigest()

def pbkdf2_hash(password, iterations=100000):
    """PBKDF2 hash (like Django)"""
    salt = os.urandom(32)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, iterations)
    salt_b64 = base64.b64encode(salt).decode()
    hash_b64 = base64.b64encode(pwd_hash).decode()
    return f"pbkdf2_sha256${iterations}${salt_b64}${hash_b64}"

print("\n📚 EXAMPLE 1: Password 'hello123'")
print("-" * 80)
password = "hello123"
print(f"\n✍️  PLAIN TEXT INPUT:")
print(f"   '{password}'")

print(f"\n🔐 SHA256 HASH (Simple):")
print(f"   {simple_hash(password)}")

print(f"\n🔒 PBKDF2 HASH (Secure - Like Django):")
hash1 = pbkdf2_hash(password)
print(f"   {hash1}")

print("\n\n📚 EXAMPLE 2: Password 'secure_pass_2024'")
print("-" * 80)
password2 = "secure_pass_2024"
print(f"\n✍️  PLAIN TEXT INPUT:")
print(f"   '{password2}'")

print(f"\n🔐 SHA256 HASH (Simple):")
print(f"   {simple_hash(password2)}")

print(f"\n🔒 PBKDF2 HASH (Secure - Like Django):")
hash2 = pbkdf2_hash(password2)
print(f"   {hash2}")

print("\n\n📚 EXAMPLE 3: Same password 'test123' HASHED TWICE")
print("-" * 80)
password3 = "test123"
print(f"\n✍️  PLAIN TEXT INPUT:")
print(f"   '{password3}'")

print(f"\n🔒 PBKDF2 HASH #1:")
hash3a = pbkdf2_hash(password3)
print(f"   {hash3a}")

print(f"\n🔒 PBKDF2 HASH #2 (same password):")
hash3b = pbkdf2_hash(password3)
print(f"   {hash3b}")

print(f"\n💡 NOTICE: Both are DIFFERENT hashes for same password!")
print(f"   Why? Because of SALT (random value added)")
print(f"   This is why hashes are so secure!")

print("\n\n" + "="*80)
print("📊 SUMMARY")
print("="*80)
print("\n✅ Plain Text → Can be seen and read")
print("❌ Hash → Cannot be reversed to get plain text")
print("🔐 Hash → Different each time (due to salt)")
print("⚡ Verification → Hash input and compare with stored hash")

print("\n\n🎮 INTERACTIVE VERSION:")
print("-" * 80)
print("Want to try it yourself?")
print("Run this instead: python demo_simple_hash.py")
print("(It will ask for input interactively)")

print("\n" + "="*80 + "\n")
