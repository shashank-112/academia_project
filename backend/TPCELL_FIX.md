# TP CELL DASHBOARD - FIX GUIDE

## Issue
The TP Cell dashboard was returning 404 errors when trying to load user profile because the User objects didn't have the `user_id` field properly linked to their TP Cell `emp_id`.

## Root Cause
When TP Cell employees were loaded into the database, the User objects lacked the `user_id` field that maps to their `emp_id`. The dashboard needs this link to fetch the employee profile.

## Solution - Two Steps

### Step 1: Fix Existing User Data (if already loaded)
Run this command in your backend directory:

```bash
python fix_user_id_mapping.py
```

This script will:
- Map all existing TP Cell users to their emp_id
- Map all Faculty users to their faculty_id  
- Map all Management users to their emp_id
- Map all Student users to their student_id
- Create missing User records if needed

### Step 2: Reload Data (if not already loaded)
If you haven't loaded the data yet, simply run the complete data loader:

```bash
python load_all_data_complete.py
```

This script now includes the `user_id` mapping when creating users, so no additional fixes will be needed.

## What Was Fixed

### Backend (`backend/tpcell/views.py`)
✅ Enhanced `tpcell_profile()` to include `gender` field
✅ Added `tpcell_stats()` endpoint to return:
   - total_students
   - students_with_backlogs
   - eligible_students
   - avg_cgpa

### Backend (`backend/tpcell/urls.py`)
✅ Added route for stats endpoint: `/api/tpcell/stats/`

### Backend (`backend/load_all_data_complete.py`)
✅ Updated Student user creation to include `user_id=student_id`
✅ Updated Faculty user creation to include `user_id=faculty_id`
✅ Updated TP Cell user creation to include `user_id=emp_id`
✅ Updated Management user creation to include `user_id=emp_id`

### Frontend (`frontend/src/services/api.js`)
✅ Added `tpcellService.getStats()` method

## Testing the Fix

1. Run one of the fix commands above
2. Navigate to TP Cell login page
3. Login with credentials like:
   - Email: `anny.gartery@tpcell.edu`
   - Password: `1234`
   - Role: `TP Cell`
4. Dashboard should load without 404 errors

## TP Cell User Credentials (from 7th_TP_CELL.csv)

| Email | Password | Role |
|-------|----------|------|
| anny.gartery@tpcell.edu | 1234 | TP Cell |
| jeannie.boxell@tpcell.edu | 1234 | TP Cell |
| mickie.pevreal@tpcell.edu | 1234 | TP Cell |
| evangelin.mctague@tpcell.edu | 1234 | TP Cell |
| brand.langstone@tpcell.edu | 1234 | TP Cell |
