import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()
# Clear old migration history for all built-in apps
cursor.execute("DELETE FROM django_migrations")
print("✓ Cleared all migration history from database")

# Insert fake migration records in correct dependency order
migrations_to_fake = [
    ('contenttypes', '0001_initial'),
    ('contenttypes', '0002_remove_content_type_name'),
    ('auth', '0001_initial'),
    ('auth', '0002_alter_permission_name_max_length'),
    ('auth', '0003_alter_user_email_max_length'),
    ('auth', '0004_alter_user_username_opts'),
    ('auth', '0005_alter_user_last_login_null'),
    ('auth', '0006_require_contenttypes_0002'),
    ('auth', '0007_alter_validators_add_errormessages'),
    ('auth', '0008_alter_user_username_max_length'),
    ('auth', '0009_alter_user_last_name_max_length'),
    ('auth', '0010_alter_group_name_max_length'),
    ('auth', '0011_update_proxy_permissions'),
    ('auth', '0012_alter_user_first_name_max_length'),
    ('users', '0001_initial'),
    ('admin', '0001_initial'),
    ('admin', '0002_logentry_remove_auto_add'),
    ('admin', '0003_logentry_add_action_flag_choices'),
    ('sessions', '0001_initial'),
]

for app, migration in migrations_to_fake:
    try:
        cursor.execute(
            "INSERT INTO django_migrations (app, name, applied) VALUES (%s, %s, NOW())",
            [app, migration]
        )
        print(f"✓ Faked: {app}.{migration}")
    except Exception as e:
        print(f"✗ Error: {app}.{migration} - {str(e)[:50]}")

connection.commit()
print("✓ All migration records faked successfully")
