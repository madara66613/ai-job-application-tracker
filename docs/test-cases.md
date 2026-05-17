# Manual Test Cases

## Test Case 01: Add a new job application

**Priority:** High  
**Area:** Application form

### Steps

1. Open the app.
2. Fill in company, role, location, status, deadline, URL, and notes.
3. Click **Add to tracker**.

### Expected Result

The new application appears at the top of the applications list and becomes selected in the details panel.

## Test Case 02: Required fields validation

**Priority:** High  
**Area:** Application form

### Steps

1. Open the app.
2. Leave the company field empty.
3. Fill in the role field.
4. Click **Add to tracker**.

### Expected Result

The browser prevents submission because the company field is required.

## Test Case 03: Filter applications by status

**Priority:** Medium  
**Area:** Status filter

### Steps

1. Open the app.
2. Click the **Applied** filter.

### Expected Result

Only applications with the Applied status are visible.

## Test Case 04: Search applications

**Priority:** Medium  
**Area:** Search

### Steps

1. Open the app.
2. Type `CRM` in the search field.

### Expected Result

Only applications containing `CRM` in company, role, location, or notes are visible.

## Test Case 05: Change application status

**Priority:** High  
**Area:** Application list

### Steps

1. Open the app.
2. Select an application.
3. Change its status from the dropdown in the application row.

### Expected Result

The status badge updates and the related dashboard counter changes.

## Test Case 06: Generate AI prep notes without API key

**Priority:** High  
**Area:** AI assistant

### Steps

1. Open the app without `.env.local`.
2. Select an application.
3. Click **Generate prep notes**.

### Expected Result

The app displays recruiter message, key requirements, CV skills, and interview tasks using mock AI output.

## Test Case 07: Open job post URL

**Priority:** Low  
**Area:** Details panel

### Steps

1. Select an application with a URL.
2. Click **Open job post**.

### Expected Result

The job URL opens in a new browser tab.

## Test Case 08: Reset demo data

**Priority:** Medium  
**Area:** Demo data

### Steps

1. Add a new application.
2. Click **Reset demo**.

### Expected Result

The list returns to the original demo applications.
