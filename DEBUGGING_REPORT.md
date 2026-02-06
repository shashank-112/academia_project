# Backend API Debugging Report

## Problem Summary

Three endpoints are failing:
1. **TP Cell Home** - "Failed to load TP Cell portal data"
2. **Management Students** - "Failed to load students - using demo data"  
3. **Management Fees** - "silent failing" (doesn't show error, just uses demo data)

---

## Root Cause Analysis

### How the flow SHOULD work:
```
User Login → JWT Token (includes email, user_id, role)
     ↓
User visits Dashboard (Frontend sends JWT token)
     ↓
Frontend calls API endpoint (GET /api/tpcell/profile/)
     ↓
Backend receives request with authenticated user
     ↓
Backend looks up Employee record by email: TPCellEmployee.objects.get(email=request.user.email)
     ↓
Backend returns employee data to Frontend
     ↓
Frontend displays data
```

### What's ACTUALLY failing:

**The email lookup is failing!** Here's why:

1. **Email Mismatch**: When you loaded employee data from CSV files, the emails in the CSV may not EXACTLY match the emails in the User table
   - User table has email: "john@college.edu"
   - TPCellEmployee has email: "john@college.edu " (extra space)
   - Or different case: "JOHN@COLLEGE.EDU" vs "john@college.edu"

2. **Missing Employee Records**: Some users might not have corresponding employee records in TPCellEmployee or ManagementEmployee tables

3. **No Fallback Lookup**: If email fails, there's NO attempt to look up using emp_id (which is stored as user_id)

4. **Silent Failures**: The frontend shows error messages, but the actual problem isn't clear

---

## Current Code Issues

### Issue 1: TP Cell Views - No Fallback Lookup
**File**: `tpcell/views.py` (lines 11-26)

```python
@api_view(['GET'])
def tpcell_profile(request):
    try:
        emp = TPCellEmployee.objects.get(email=request.user.email)  # ← FAILS if email doesn't match!
        # ... return data
    except TPCellEmployee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
```

**Problem**: 
- Returns generic 404 error if email doesn't match
- No attempt to look up by `user_id` (emp_id)
- No logging to understand WHY it failed

### Issue 2: Management Views - Same Problem
**File**: `management/views.py` (lines 14-34)

```python
@api_view(['GET'])
def management_profile(request):
    emp = None
    try:
        emp = ManagementEmployee.objects.get(email=request.user.email)  # ← Single email lookup
    except ManagementEmployee.DoesNotExist:
        uid = getattr(request.user, 'user_id', None)
        if uid:
            try:
                emp = ManagementEmployee.objects.get(emp_id=uid)  # ← Fallback exists here!
            except ManagementEmployee.DoesNotExist:
                emp = None
```

**Note**: Management profile HAS fallback, but stats/student endpoints DON'T!

### Issue 3: Fees Page - Returns Demo Data Silently
**File**: `frontend/src/components/management-dashboard/pages/Fees.js` (lines 159-172)

```javascript
} catch (err) {
    console.error('ERROR LOADING FEE DATA');
    console.error('Exception:', err);  // ← Logs to console, but not shown to user
    if (err.response) {
        console.error('HTTP Status:', err.response.status);
        console.error('Error Data:', err.response.data);
    }
    
    setError('Failed to load fee data - check console for details');
    // ↑ This error message is set but might not be displayed properly
```

---

## Solution

### Step 1: Add Logging and Fallback Lookup in Backend

Add better error handling and logging to all endpoints that do user lookups. The endpoints should:
1. Try email lookup first
2. Fall back to user_id lookup
3. Return clear error messages with logging

### Step 2: Verify Employee Records Exist

Check that:
- All TPCellEmployee records have emails matching User table
- All ManagementEmployee records have emails matching User table
- user_id values match emp_id values

### Step 3: Ensure Error Messages Show to User

Make sure frontend displays errors properly (not just console logging)

---

## Files That Need Fixing

### Backend:
1. `tpcell/views.py` - Add fallback lookup, logging, better error messages
2. `management/views.py` - Ensure all endpoints have fallback lookup

### Data Verification:
1. Check `tpcell_tpcellemployee` table in database
2. Check `management_managementemployee` table in database
3. Check `users_user` table for mismatches

