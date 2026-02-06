# Academia - College Management System

A full-stack college management application built with React, Django, and PostgreSQL.

## Features

- **Role-based Login**: Students, Faculty, Management, TP Cell, and Admin
- **Student Dashboard**: View profile, academic records, and backlogs
- **Faculty Dashboard**: View profile and course assignments
- **Management Dashboard**: Manage college operations
- **TP Cell Dashboard**: Track placements and student profiles
- **Admin Dashboard**: System administration and controls
- **JWT Authentication**: Secure API endpoints
- **Responsive Design**: Works on desktop and mobile

## Project Structure

```
academia/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── login/       # Login page
│   │   │   ├── student-dashboard/
│   │   │   ├── faculty-dashboard/
│   │   │   ├── management-dashboard/
│   │   │   ├── tpcell-dashboard/
│   │   │   └── admin-dashboard/
│   │   ├── context/         # Auth context
│   │   ├── services/        # API services
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── backend/                  # Django application
    ├── academia/            # Project settings
    ├── users/              # Authentication
    ├── students/           # Student data
    ├── faculty/            # Faculty data
    ├── management/         # Management data
    ├── tpcell/             # TP Cell data
    ├── notifications/      # Notifications
    ├── manage.py
    └── requirements.txt
```

## Installation & Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure database**
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`
   ```bash
   cp .env.example .env
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Load data from CSV (optional)**
   ```bash
   # Place your CSV files in the data directory
   python manage.py shell
   # Then run the data loading script
   ```

8. **Start development server**
   ```bash
   python manage.py runserver
   ```
   Backend runs on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Frontend runs on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users/login/` - Login with email, password, and role

### Student Endpoints
- `GET /api/students/profile/` - Get student profile
- `GET /api/students/academics/` - Get academic records
- `GET /api/students/backlogs/` - Get backlogs

### Faculty Endpoints
- `GET /api/faculty/profile/` - Get faculty profile
- `GET /api/faculty/assignments/` - Get course assignments

### Management Endpoints
- `GET /api/management/profile/` - Get management profile

### TP Cell Endpoints
- `GET /api/tpcell/profile/` - Get TP Cell profile

### Notifications
- `GET /api/notifications/` - Get notifications for user

## Testing the Application

### Test Accounts

Since you have dummy data in PostgreSQL, use the following to test:

**Student Login**
- Email: Use any student email from your data (e.g., `1y_cse_a_1@college.edu`)
- Password: Use their passcode from the database
- Role: student

**Faculty Login**
- Email: Use any faculty email from your data
- Password: Use their passcode
- Role: faculty

**Management Login**
- Email: Use any management email
- Password: Use their passcode
- Role: management

**TP Cell Login**
- Email: Use any TP Cell email
- Password: Use their passcode
- Role: tpcell

## Importing Existing Data

To load your CSV data into the database:

1. Place CSV files in `backend/data_import/`
2. Create a management command:
   ```bash
   python manage.py loadcsv
   ```

## Database Schema

The application uses the following tables from your CSV data:
- `STUDENT_PERSONAL_INFO` → Student model
- `STUD_ACAD` → StudentAcademic model
- `STUDENT_BACKLOGS` → StudentBacklog model
- `FACULTY_INFO` → Faculty model
- `FACULTY_STUDENT_DEPT` → FacultyAssignment model
- `MANAGEMENT` → ManagementEmployee model
- `TP_CELL` → TPCellEmployee model
- `NOTIFICATIONS` → Notification model

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=academia_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Frontend
No environment variables needed; configured to use `http://localhost:8000` as backend

## Next Steps

1. **Load CSV Data**: Import your CSV files into the database
2. **Customize Dashboards**: Add more features to each dashboard
3. **Add Notifications**: Implement real-time notifications
4. **User Management**: Add user creation and management features
5. **Reports**: Add reporting functionality

## Troubleshooting

### Port Already in Use
- React: Change port with `PORT=3001 npm start`
- Django: Change port with `python manage.py runserver 8001`

### Database Connection Error
- Verify PostgreSQL is running
- Check credentials in `.env` file
- Ensure database `academia_db` exists

### CORS Errors
- Backend has CORS configured for `http://localhost:3000`
- Update `CORS_ALLOWED_ORIGINS` in `settings.py` if needed

## Future Enhancements

- [ ] Email notifications
- [ ] Advanced search and filters
- [ ] Grade analytics
- [ ] Placement statistics
- [ ] Fee management
- [ ] Document management
- [ ] Mobile app

## License

This project is licensed under the MIT License.
