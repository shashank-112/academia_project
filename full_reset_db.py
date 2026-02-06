import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()

# Get all table names except system tables
cursor.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
""")

tables = cursor.fetchall()
table_names = [table[0] for table in tables]

print(f"Found {len(table_names)} tables to drop...")
print(f"Tables: {table_names}")

# Drop all tables with CASCADE to handle foreign keys
for table in table_names:
    try:
        cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
        print(f"✓ Dropped {table}")
    except Exception as e:
        print(f"✗ Error dropping {table}: {e}")

connection.commit()
print("\n✓ Database tables dropped successfully - ready for fresh migrations")
