import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()

# Drop and recreate django_migrations table cleanly
try:
    cursor.execute("DROP TABLE IF EXISTS django_migrations CASCADE")
    print("✓ Dropped django_migrations table")
except Exception as e:
    print(f"✗ Error dropping django_migrations: {e}")
    sys.exit(1)

# Create fresh django_migrations table
cursor.execute('''
    CREATE TABLE django_migrations (
        id SERIAL PRIMARY KEY,
        app VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        applied TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(app, name)
    )
''')
print("✓ Created fresh django_migrations table")

connection.commit()
print("✓ Database migrations cleaned successfully - ready for fresh migrations")
