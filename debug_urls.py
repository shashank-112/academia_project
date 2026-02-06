#!/usr/bin/env python
"""
Debug script to list all URL patterns registered in Django
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.urls import get_resolver

resolver = get_resolver()

print("="*80)
print("ALL REGISTERED URL PATTERNS")
print("="*80)

def show_patterns(patterns, prefix=""):
    for pattern in patterns:
        pattern_str = str(pattern.pattern)
        full_path = prefix + pattern_str
        print(f"{full_path}")
        
        # If it has nested patterns, show them
        if hasattr(pattern, 'url_patterns'):
            show_patterns(pattern.url_patterns, full_path)

show_patterns(resolver.url_patterns)

print("\n" + "="*80)
print("TPCELL PATTERNS:")
print("="*80)

# Specifically look for tpcell
from django.urls import get_resolver
for pattern in resolver.url_patterns:
    if 'tpcell' in str(pattern.pattern):
        print(f"Found: {pattern.pattern}")
        if hasattr(pattern, 'url_patterns'):
            print(f"  Has nested patterns:")
            for nested in pattern.url_patterns:
                print(f"    - {nested.pattern}")
