# Complete Troubleshooting & Fix Guide

## What I Fixed

I've added comprehensive logging, error messages, and fallback lookup mechanisms to help diagnose and fix the failing endpoints.

---

## Backend Changes Made

### 1. **TP Cell Views** (`tpcell/views.py`)

**Added:**
- ✅ Proper logging with `import logging`
- ✅ Email lookup with fallback to `user_id` (emp_id) lookup
- ✅ Detailed error messages showing what looked up and what failed
- ✅ Better exception handling in `tpcell_stats()`
- ✅ Logging for successful lookups

**Example Log Output:**
```
✓ TP Cell Profile: Found employee by email: john@college.edu
✓ TP Cell Stats: Found employee by emp_id: 101
✗ TP Cell Profile: No employee with email 'test@college.edu'
```

### 2. **Management Views** (`management/views.py`)

**Added:**
- ✅ Logging to all endpoints
- ✅ Better error messages in `get_all_students()`
- ✅ Improved `get_fee_summary()` with null value handling
- ✅ Enhanced `get_student_fee_details()` with proper error reporting
- ✅ Filter validation with meaningful error messages
- ✅ Fallback lookup in `management_profile()`

**Example Log Output:**
```
✓ Retrieved 42 students with filters: year_id=4
✗ Error fetching students: Column 'student.roll_no' doesn't exist
```

### 3. **Frontend Error Messages**

**Improved in 3 files:**
- `frontend/src/components/tpcell-dashboard/pages/Home.js` - Better error extraction
- `frontend/src/components/management-dashboard/pages/Students.js` - Shows actual API error
- `frontend/src/components/management-dashboard/pages/Fees.js` - Enhanced error reporting with server status

**Now shows specific errors like:**
- ❌ "API Error: Employee not found for user john@college.edu (user_id: 101)"
- ❌ "Employee record not found in the system. Please contact administrator."
- ❌ "No response from server - connection issue. Check if backend is running."

---

## Root Causes (Why It's Failing)

### Issue 1: Email Mismatch
The system tries to find TP Cell employees by email:
```python
emp = TPCellEmployee.objects.get(email=request.user.email)  # FAILS!
```

**Why it fails:**
- User emails in `users_user` table might not match `tpcell_tpcellemployee` table
- Example: `john@college.edu` vs `john.doe@college.edu`
- Or case sensitivity: `JOHN@COLLEGE.EDU` vs `john@college.edu`

### Issue 2: Missing Employee Record
If no email match is found, and no `user_id` match exists, the lookup fails with 404.

### Issue 3: Database Connection Issues
If the database query itself fails (missing column, connection error), it returns 500 error.

### Issue 4: Silent Frontend Failures
The frontend was catching errors but not showing them to users in a readable format.

---

## How to Debug Now

### Step 1: Check Django Logs

Run your Django server and watch for the new logging output:

```bash
python manage.py runserver
```

Look for lines like:
```
✓ TP Cell Profile: Found employee by email: john@college.edu
✗ TP Cell Profile: No employee with email 'test@college.edu'
ERROR LOGGING FEE DATA: ...
```

### Step 2: Check Frontend Console

Open browser DevTools (F12) → Console tab. You'll now see:
```
ERROR LOADING TP CELL DATA:
HTTP Status: 404
Error Data: {error: "Employee not found for user john@college.edu (user_id: 101)"}
```

### Step 3: Verify Employee Records in Database

Check if employees exist in the database:

```bash
# Open Django shell
python manage.py shell
```

Then run:

```python
from tpcell.models import TPCellEmployee
from management.models import ManagementEmployee
from users.models import User

# List all TP Cell employees
TPCellEmployees = TPCellEmployee.objects.all()
for emp in TPCellEmployees:
    print(f"emp_id={emp.emp_id}, email={emp.email}")

# List all Management employees
mgmt_employees = ManagementEmployee.objects.all()
for emp in mgmt_employees:
    print(f"emp_id={emp.emp_id}, email={emp.email}")

# List all users (excluding standard Django users)
users = User.objects.filter(role__in=['tpcell', 'management'])
for user in users:
    print(f"user_id={user.user_id}, email={user.email}, role={user.role}")
```

### Step 4: Check for Email Mismatches

Look for differences between User emails and Employee emails:

```python
# Check if a TP Cell user's email exists in TPCellEmployee table
from users.models import User
from tpcell.models import TPCellEmployee

tp_users = User.objects.filter(role='tpcell')
for user in tp_users:
    emp = TPCellEmployee.objects.filter(email=user.email).first()
    if emp:
        print(f"✓ {user.email} found in TPCellEmployee")
    else:
        print(f"✗ {user.email} NOT found in TPCellEmployee")
        # Try matching by user_id
        emp2 = TPCellEmployee.objects.filter(emp_id=user.user_id).first()
        if emp2:
            print(f"  But found by emp_id {user.user_id} with email {emp2.email}")
```

---

## Fixing the Issues

### Option A: Fix Email Mismatches (Recommended)

If you find emails don't match, you have two choices:

**Choice 1: Update User emails to match TPCellEmployee emails**
```python
from django.db import connection
from users.models import User
from tpcell.models import TPCellEmployee

user = User.objects.get(user_id=101)  # TP Cell emp_id
emp = TPCellEmployee.objects.get(emp_id=101)

# Update user email to match employee email
user.email = emp.email
user.save()
print(f"Updated user email to {emp.email}")
```

**Choice 2: Update TPCellEmployee emails to match User emails**
```python
user = User.objects.get(user_id=101)
emp = TPCellEmployee.objects.get(emp_id=101)

emp.email = user.email
emp.save()
print(f"Updated employee email to {user.email}")
```

### Option B: Check user_id/emp_id Mapping

Make sure `User.user_id` matches the employee's `emp_id`:

```python
user = User.objects.get(email='john@college.edu')
emp = TPCellEmployee.objects.get(email='john@college.edu')

if user.user_id == emp.emp_id:
    print(f"✓ user_id and emp_id match: {user.user_id}")
else:
    print(f"✗ Mismatch: user.user_id={user.user_id}, emp.emp_id={emp.emp_id}")
    # Fix it
    user.user_id = emp.emp_id
    user.save()
```

### Option C: Reload Employee Data Correctly

If you need to reload data from CSV, make sure to:

1. Extract emails from the actual data source
2. Ensure emails in User table match emails in Employee table
3. Ensure user_id values match emp_id values

---

## Testing the Fix

### Test 1: TP Cell Home Page

1. Log in as a TP Cell user
2. Go to TP Cell Dashboard → Home
3. You should see:
   - ✓ Profile info (name, designation)
   - ✓ Statistics (students, backlogs, etc.)
   - ✓ Notifications

### Test 2: Management Students Page

1. Log in as a Management user
2. Go to Management Dashboard → Students
3. You should see:
   - ✓ List of all students
   - ✓ Filters working (Year, Branch, Section)
   - ✓ Select a student to see details

### Test 3: Management Fees Page

1. Log in as a Management user
2. Go to Management Dashboard → Fees
3. You should see:
   - ✓ Fee summary (Expected, Collected, Pending)
   - ✓ Student fee details with filters
   - ✓ Proper fee breakdown per student

---

## Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Employee not found for user john@college.edu (user_id: 101)" | Email doesn't match employee | Fix email mismatch (Option A above) |
| "No response from server" | Backend not running | Start Django server: `python manage.py runserver` |
| "Server error while loading" | Database query failed | Check Django logs for SQL error details |
| "Invalid year filter: abc" | Filter value is not a number | Make sure filters are numeric IDs |
| "Error fetching students: Column 'student.roll_no' doesn't exist" | Database schema issue | Check if Student model has roll_no field |

---

## Verification Checklist

After making changes, verify:

- [ ] Django server starts without errors
- [ ] Database migrations are applied (`python manage.py migrate`)
- [ ] All employee records exist in database
- [ ] User emails match employee emails
- [ ] User user_id matches employee emp_id
- [ ] Frontend shows error messages in browser console
- [ ] No JavaScript errors in browser DevTools
- [ ] API returns proper error codes (404 for not found, 500 for server errors)
- [ ] Logging shows successful lookups or clear failure reasons

---

## Example Log Output (After Fixes)

When logging in and accessing pages, you should see:

```
✓ TP Cell Profile: Found employee by email: john@college.edu
✓ TP Cell Stats: Found employee by emp_id: 101
✓ TP Cell Stats calculated successfully for 101

✓ Retrieved 42 students with filters: year_id=4
✓ Management Profile: Found employee by email: admin@college.edu

Fetching fee summary...
Found 84 fee records in database
✓ Fee summary: Expected=8400000, Collected=4200000, Pending=4200000
✓ Retrieved 42 fee records with filters: year_id=4
```

---

## Still Having Issues?

1. **Check Django logs** - Look for ✗ or ERROR messages
2. **Check browser console** - F12 → Console tab
3. **Verify database** - Use `python manage.py shell` to query directly
4. **Check email mismatches** - Are emails case-sensitive?
5. **Verify IDs** - Does user.user_id match emp_id?

