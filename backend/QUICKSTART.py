"""
Quick Start Guide for Academia College Management System
"""

print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                         ACADEMIA QUICK START GUIDE                         ║
║                    College Management System Setup                          ║
╚════════════════════════════════════════════════════════════════════════════╝

IMPORTANT NOTES:
- You have PostgreSQL database 'academia_db' with dummy data
- This project has 2 main parts: Backend (Django) and Frontend (React)
- Make sure both servers run simultaneously

═══════════════════════════════════════════════════════════════════════════════

BACKEND SETUP (Django)
─────────────────────────────────────────────────────────────────────────────  

1. Open PowerShell/Command Prompt and navigate to backend folder:
   
   cd backend

2. Create virtual environment:
   
   python -m venv venv

3. Activate virtual environment:
   
   # Windows
   venv\\Scripts\\activate
   
   # Or if above doesn't work:
   .\\venv\\Scripts\\Activate.ps1

4. Install dependencies:
   
   pip install -r requirements.txt

5. Create .env file from template:
   
   # Copy and edit with your PostgreSQL credentials
   cp .env.example .env
   
   Edit .env and set:
   - DB_NAME=academia_db
   - DB_USER=postgres
   - DB_PASSWORD=your_postgres_password
   - DB_HOST=localhost
   - DB_PORT=5432

6. Run migrations:
   
   python manage.py migrate

7. Create admin user (optional):
   
   python manage.py createsuperuser

8. Start Django server:
   
   python manage.py runserver
   
   ✓ Backend runs on: http://localhost:8000

═══════════════════════════════════════════════════════════════════════════════

FRONTEND SETUP (React)
─────────────────────────────────────────────────────────────────────────────

1. Open a NEW PowerShell/Command Prompt and navigate to frontend folder:
   
   cd frontend

2. Install Node.js dependencies:
   
   npm install

3. Start React development server:
   
   npm start
   
   ✓ Frontend runs on: http://localhost:3000
   ✓ Browser will automatically open

═══════════════════════════════════════════════════════════════════════════════

TESTING THE APPLICATION
─────────────────────────────────────────────────────────────────────────────

1. Both servers should be running:
   - Django: http://localhost:8000
   - React: http://localhost:3000

2. Open http://localhost:3000 in browser

3. You'll see the LOGIN page with:
   - Email input
   - Password input
   - 5 role selection buttons (Student, Faculty, Management, TP Cell, Admin)

4. Sample Login Credentials (from your database):
   
   STUDENT:
   - Email: Look up any student email from STUDENT_PERSONAL_INFO
   - Password: Use their 'passcode' field
   - Role: Select "Student" button
   
   FACULTY:
   - Email: Look up any faculty email from FACULTY_INFO
   - Password: Use their 'passcode' field
   - Role: Select "Faculty" button
   
   MANAGEMENT:
   - Email: Look up any email from MANAGEMENT table
   - Password: Use their 'passcode' field
   - Role: Select "Management" button
   
   TP CELL:
   - Email: Look up any email from TP_CELL table
   - Password: Use their 'passcode' field
   - Role:Select "TP Cell" button

5. After login, you'll see role-specific dashboard

═══════════════════════════════════════════════════════════════════════════════

DATABASE & CREDENTIALS
─────────────────────────────────────────────────────────────────────────────

Your existing data in academia_db includes:
✓ 1,320 students across 7 branches (CSE, ECE, CSM, CSD, EEE, CE, ME)
✓ 52 faculty members
✓ 5 management employees
✓ 5 TP Cell employees
✓ Academic records, backlogs, fees, notifications, etc.

To view/modify data:
- Use Django Admin: http://localhost:8000/admin
- Use SQL queries with pgAdmin or psql

═══════════════════════════════════════════════════════════════════════════════

TROUBLESHOOTING
─────────────────────────────────────────────────────────────────────────────

Issue: "Database connection refused"
→ Check PostgreSQL is running
→ Verify credentials in .env file
→ Confirm academia_db exists

Issue: "Port 3000 already in use"
→ PORT=3001 npm start

Issue: "Port 8000 already in use"
→ python manage.py runserver 8001

Issue: "ModuleNotFoundError: No module named 'django'"
→ Make sure virtual environment is activated
→ Run: pip install -r requirements.txt

Issue: "npm: command not found"
→ Install Node.js from nodejs.org

═══════════════════════════════════════════════════════════════════════════════

PROJECT STRUCTURE
─────────────────────────────────────────────────────────────────────────────

frontend/
├── src/
│   ├── components/
│   │   ├── login/           ← Login page with role selection
│   │   ├── student-dashboard/
│   │   ├── faculty-dashboard/
│   │   ├── management-dashboard/
│   │   ├── tpcell-dashboard/
│   │   └── admin-dashboard/
│   ├── context/AuthContext.js    ← Authentication state
│   ├── services/api.js           ← API calls
│   ├── App.js                    ← Main routing
│   └── index.js
└── package.json

backend/
├── academia/           ← Django settings
├── users/             ← Authentication
├── students/          ← Student APIs
├── faculty/           ← Faculty APIs
├── management/        ← Management APIs
├── tpcell/            ← TP Cell APIs
├── notifications/     ← Notifications
├── manage.py
└── requirements.txt

═══════════════════════════════════════════════════════════════════════════════

API ENDPOINTS (LOCAL)
─────────────────────────────────────────────────────────────────────────────

Authentication:
  POST /api/users/login/

Student APIs:
  GET /api/students/profile/
  GET /api/students/academics/
  GET /api/students/backlogs/

Faculty APIs:
  GET /api/faculty/profile/
  GET /api/faculty/assignments/

Management APIs:
  GET /api/management/profile/

TP Cell APIs:
  GET /api/tpcell/profile/

Notifications:
  GET /api/notifications/

═══════════════════════════════════════════════════════════════════════════════

NEXT STEPS
─────────────────────────────────────────────────────────────────────────────

1. ✓ Run both servers (Django + React)
2. ✓ Test login with sample credentials
3. ✓ Explore each dashboard
4. → Add more features to dashboards
5. → Implement student fee payment
6. → Add notifications system
7. → Create advanced search/filters
8. → Build reporting functionality

═══════════════════════════════════════════════════════════════════════════════

HELPFUL COMMANDS
─────────────────────────────────────────────────────────────────────────────

Django:
  python manage.py makemigrations      # Create DB migrations
  python manage.py migrate              # Apply migrations
  python manage.py createsuperuser      # Create admin user
  python manage.py shell                # Django shell
  python manage.py runserver 0.0.0.0:8000  # Run on specific port

React:
  npm install                           # Install packages
  npm start                             # Start dev server
  npm build                             # Build for production
  npm test                              # Run tests

═══════════════════════════════════════════════════════════════════════════════

FEATURES IMPLEMENTED
─────────────────────────────────────────────────────────────────────────────

✓ Role-based login system (5 roles)
✓ JWT token authentication
✓ Student dashboard with:
  - Profile information
  - Academic records
  - Backlog tracking
✓ Faculty dashboard with:
  - Profile information
  - Course assignments
✓ Management dashboard
✓ TP Cell dashboard
✓ Admin dashboard (skeleton)
✓ Notification system
✓ CORS enabled for frontend-backend communication
✓ Professional UI with animations
✓ Responsive design

═══════════════════════════════════════════════════════════════════════════════

Questions or Issues?
→ Check README.md in project root
→ Review Django logs: python manage.py runserver
→ Check browser console (F12) for React errors
→ Verify .env configuration

═══════════════════════════════════════════════════════════════════════════════
""")

