#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path

def main():
    """Run administrative tasks."""
    # Ensure project root is on sys.path so the autoreloader child process
    # can always import local apps (prevents intermittent ModuleNotFoundError).
    project_root = Path(__file__).resolve().parent
    sys.path.insert(0, str(project_root))

    # Log environment at startup so we can diagnose import errors
    try:
        import time
        log_file = project_root / 'runserver_import_debug.log'
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"{time.asctime()} PID={os.getpid()} CWD={os.getcwd()} ARGV={sys.argv}\\n")
            f.write("sys.path:\n")
            for p in sys.path:
                f.write(f"  {p}\\n")
            f.write("---\n")
    except Exception:
        pass

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academia.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Couldn't import Django") from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
