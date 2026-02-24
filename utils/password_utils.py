"""
Password Utilities Module
Provides secure password hashing and verification functions for all models
"""
from django.contrib.auth.hashers import make_password, check_password

def is_password_hashed(password_str):
    """
    Check if a password string is already hashed.
    Django hashes start with specific algorithm prefixes.
    """
    if not password_str:
        return False
    hashed_prefixes = ('pbkdf2_sha256$', 'argon2$', 'bcrypt$', 'scrypt$', 'crypt$')
    return password_str.startswith(hashed_prefixes)

def hash_password(password):
    """
    Hash a plain text password.
    Safe to call even if already hashed (will double-hash, so avoid).
    """
    if is_password_hashed(password):
        return password  # Already hashed, return as is
    return make_password(password)

def verify_password(plain_password, hashed_password):
    """
    Verify a plain text password against a hashed password.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password from database
    
    Returns:
        bool: True if passwords match, False otherwise
    
    Usage:
        >>> verify_password('user123', student.passcode)
        True
    """
    if not plain_password or not hashed_password:
        return False
    
    # If hashed_password is not actually hashed, do a direct comparison
    # (fallback for legacy data)
    if not is_password_hashed(hashed_password):
        return plain_password == hashed_password
    
    # Use Django's check_password for secure comparison
    return check_password(plain_password, hashed_password)

def set_password(obj, plain_password):
    """
    Set a hashed password on any model instance.
    
    Args:
        obj: Model instance (Student, Faculty, ManagementEmployee, or TPCellEmployee)
        plain_password: Plain text password to hash and set
    
    Usage:
        >>> set_password(student, 'newpassword123')
        >>> student.save()
    """
    obj.passcode = make_password(str(plain_password))
    return obj
