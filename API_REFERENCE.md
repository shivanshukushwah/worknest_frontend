# Worknest Mobile App - API Integration Guide

## API Endpoints Reference

Base URL: `https://worknest-backend-5c3a.onrender.com`

All endpoints require JWT token in header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass123",
  "role": "student|employer",
  
  // Employer only
  "businessName": "Tech Startup",
  "businessType": "Technology",
  "businessLocation": "Bangalore"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "student|employer",
      "isPhoneVerified": false
    }
  }
}
```

### Verify OTP
**POST** `/api/auth/verify-otp`

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
**GET** `/api/auth/me`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student|employer"
  }
}
```

### Logout
**POST** `/api/auth/logout`

---

## User Profile Endpoints

### Student Profile

#### Get Student Profile
**GET** `/api/users/student/me` or `/api/users/student/{userId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "student",
    "avatar": "https://...",
    "skillScore": 85,
    "skills": ["React", "Node.js", "MongoDB"],
    "education": [
      {
        "id": "edu_id",
        "school": "XYZ University",
        "degree": "Bachelor",
        "fieldOfStudy": "Computer Science",
        "startYear": 2020,
        "endYear": 2024
      }
    ],
    "experience": [
      {
        "id": "exp_id",
        "company": "Tech Corp",
        "position": "Junior Developer",
        "startDate": "2023-01-15",
        "endDate": "2024-01-15"
      }
    ],
    "walletBalance": 5000,
    "completedJobsCount": 3
  }
}
```

#### Update Student Profile
**PUT** `/api/users/student/me`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "skills": ["React", "Vue.js", "Node.js"],
  "avatar": "https://..."
}
```

#### Add Education
**POST** `/api/users/student/education`

**Request Body:**
```json
{
  "school": "XYZ University",
  "degree": "Bachelor",
  "fieldOfStudy": "Computer Science",
  "startYear": 2020,
  "endYear": 2024,
  "description": "Optional description"
}
```

#### Update Education
**PUT** `/api/users/student/education/{educationId}`

#### Delete Education
**DELETE** `/api/users/student/education/{educationId}`

#### Add Experience
**POST** `/api/users/student/experience`

**Request Body:**
```json
{
  "company": "Tech Corp",
  "position": "Junior Developer",
  "startDate": "2023-01-15",
  "endDate": "2024-01-15",
  "description": "Optional description"
}
```

#### Update Experience
**PUT** `/api/users/student/experience/{experienceId}`

#### Delete Experience
**DELETE** `/api/users/student/experience/{experienceId}`

#### Update Skills
**PUT** `/api/users/student/skills`

**Request Body:**
```json
{
  "skills": ["React", "Node.js", "MongoDB"]
}
```

### Employer Profile

#### Get Employer Profile
**GET** `/api/users/employer/me` or `/api/users/employer/{userId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Company Admin",
    "email": "admin@company.com",
    "phone": "9876543210",
    "role": "employer",
    "avatar": "https://...",
    "businessName": "Tech Startup",
    "businessType": "Technology",
    "businessLocation": "Bangalore",
    "walletBalance": 50000,
    "activeJobsCount": 5
  }
}
```

#### Update Employer Profile
**PUT** `/api/users/employer/me`

**Request Body:**
```json
{
  "businessName": "Tech Startup",
  "businessType": "Technology",
  "businessLocation": "Bangalore"
}
```

### Upload Avatar
**PUT** `/api/users/profile`

**Request:** Form data with the avatar image (key usually `avatar` or as defined by backend). The endpoint updates the user profile, returning the new avatar URL.

**Response:**
```json
{
  "success": true,
  "data": {
    "avatar": "https://..."
  }
}
```

---

## Job Endpoints

### Get All Jobs
**GET** `/api/jobs`

**Query Parameters:**
- `page=1`
- `limit=20`
- `type=offline|online` (optional)
- `location=string` (optional)
- `minSalary=number` (optional)
- `maxSalary=number` (optional)
- `skills=skill1,skill2` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "job_id",
      "title": "Full Stack Developer",
      "description": "Join our team...",
      "type": "online|offline",
      "salary": 50000,
      "salaryType": "fixed|hourly|range",
      "positionsRequired": 3,
      "location": "Bangalore",
      "skills": ["React", "Node.js"],
      "deadline": "2024-12-31",
      "status": "open|closed|filled|in_progress|completed",
      "employerId": "emp_id",
      "employer": {
        "id": "emp_id",
        "name": "Company Name",
        "businessName": "Company",
        "avatar": "https://..."
      },
      "applicationsCount": 5,
      "applicationStatus": "applied|shortlisted|rejected|hired|completed",
      "applicationId": "app_id"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Get Job by ID
**GET** `/api/jobs/{jobId}`

### Create Job (Employer)
**POST** `/api/jobs`

**Request Body:**
```json
{
  "title": "Full Stack Developer",
  "description": "Join our team...",
  "type": "online|offline",
  "salary": 50000,
  "salaryType": "fixed|hourly|range",
  "positionsRequired": 3,
  "location": "Bangalore", // For offline only
  "skills": ["React", "Node.js"],
  "deadline": "2024-12-31"
}
```

### Update Job (Employer)
**PUT** `/api/jobs/{jobId}`

### Delete Job (Employer)
**DELETE** `/api/jobs/{jobId}`

### Close Job (Employer)
**POST** `/api/jobs/{jobId}/close`

### Search Jobs
**GET** `/api/jobs/search`

**Query Parameters:**
- `q=search_term`
- `page=1`

### Get Employer's Jobs
**GET** `/api/jobs/employer/my-jobs`

**Query Parameters:**
- `page=1`
- `limit=20`

---

## Job Application Endpoints

### Apply for Job
**POST** `/api/applications/apply/{jobId}`

**Request Body:**
```json
{
  "coverLetter": "I'm interested in this role...",
  "profileUrl": "https://linkedin.com/in/..." // For online jobs
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "app_id",
    "jobId": "job_id",
    "studentId": "student_id",
    "status": "applied",
    "appliedAt": "2024-01-15T10:30:00Z",
    "profileUrl": "https://...",
    "coverLetter": "I'm interested...",
    "student": {
      "id": "student_id",
      "name": "John Doe",
      "avatar": "https://...",
      "skillScore": 85
    },
    "job": { ...job_data... }
  }
}
```

### Get My Applications (Student)
**GET** `/api/applications/my`

**Query Parameters:**
- `page=1`
- `limit=20`
- `status=applied|shortlisted|rejected|hired|completed` (optional)
- `jobType=online|offline` (optional)

### Get Job Applications (Employer)
**GET** `/api/jobs/{jobId}/applications`

**Query Parameters:**
- `page=1`
- `limit=20`

### Get Shortlisted Applications (Employer)
**GET** `/api/jobs/{jobId}/shortlisted`

**Query Parameters:**
- `page=1`

### Update Application Status (Employer)
**PUT** `/api/applications/{applicationId}`

**Request Body:**
```json
{
  "status": "applied|shortlisted|rejected|hired|completed"
}
```

### Shortlist Application (Employer)
**POST** `/api/applications/{applicationId}/shortlist`

### Reject Application (Employer)
**POST** `/api/applications/{applicationId}/reject`

### Hire Applicant (Employer)
**POST** `/api/applications/{applicationId}/hire`

### Get Application Details
**GET** `/api/applications/{applicationId}`

---

## Wallet Endpoints

### Get Wallet
**GET** `/api/wallet`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "wallet_id",
    "userId": "user_id",
    "balance": 10000,
    "currency": "INR",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Balance
**GET** `/api/wallet/balance`

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 10000
  }
}
```

### Get Transactions
**GET** `/api/wallet/transactions`

**Query Parameters:**
- `page=1`
- `limit=10`
- `type=credit|debit|withdraw|deposit` (optional)
- `status=completed|pending|failed` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "trans_id",
      "walletId": "wallet_id",
      "type": "credit|debit|withdraw|deposit",
      "amount": 500,
      "description": "Job payment for Job Title",
      "relatedJobId": "job_id",
      "status": "completed|pending|failed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ...pagination_data... }
}
```

### Create Withdrawal Request
**POST** `/api/wallet/withdraw`

**Request Body:**
```json
{
  "amount": 5000,
  "bankDetails": {
    "accountHolder": "John Doe",
    "accountNumber": "123456789012",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank of India"
  }
}
```

### Get Withdrawal Requests
**GET** `/api/wallet/withdrawals`

**Query Parameters:**
- `page=1`
- `limit=10`

### Get Withdrawal Details
**GET** `/api/wallet/withdrawals/{withdrawalId}`

### Initiate Deposit (Razorpay)
**POST** `/api/wallet/deposit/initiate`

**Request Body:**
```json
{
  "amount": 1000
}
```

### Verify Payment
**POST** `/api/wallet/deposit/verify`

**Request Body:**
```json
{
  "razorpay_payment_id": "pay_...",
  "razorpay_order_id": "order_...",
  "razorpay_signature": "sig_..."
}
```

---

## Review Endpoints

### Create Review
**POST** `/api/reviews/job/{jobId}`

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Great experience working with this employer!"
}
```

### Get User Reviews
**GET** `/api/reviews/user/{userId}`

**Query Parameters:**
- `page=1`
- `limit=10`

### Get Job Reviews
**GET** `/api/reviews/job/{jobId}`

**Query Parameters:**
- `page=1`
- `limit=10`

### Get User Review Stats
**GET** `/api/reviews/user/{userId}/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalReviews": 12,
    "ratingBreakdown": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 5,
      "5": 4
    }
  }
}
```

### Update Review (Employer Response)
**PUT** `/api/reviews/{reviewId}`

**Request Body:**
```json
{
  "employerResponse": "Thank you for the feedback!"
}
```

### Get My Reviews
**GET** `/api/reviews/me`

**Query Parameters:**
- `page=1`
- `limit=10`

---

## Notification Endpoints

### Get Notifications
**GET** `/api/notifications`

**Query Parameters:**
- `page=1`
- `limit=20`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_id",
      "userId": "user_id",
      "type": "job_posted|application_status|job_completed|new_review|payment_received|withdrawal_processed|message",
      "title": "New Job Posted",
      "message": "A new job matching your skills...",
      "data": { ...additional_data... },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ...pagination_data... }
}
```

### Get Unread Count
**GET** `/api/notifications/unread/count`

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### Mark as Read
**PUT** `/api/notifications/{notificationId}/read`

### Mark All as Read
**POST** `/api/notifications/read-all`

### Delete Notification
**DELETE** `/api/notifications/{notificationId}`

### Register Push Token
**POST** `/api/notifications/push-token`

**Request Body:**
```json
{
  "token": "expo_push_token_here"
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

---

## Rate Limiting

No explicit rate limiting mentioned in requirements. Implement as needed based on backend configuration.

## Authentication

All endpoints (except auth routes) require:

```
Headers:
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## Implementation Notes

1. **Token Refresh**: Implement token refresh logic if backend provides refresh tokens
2. **Error Handling**: Use `getErrorMessage()` utility for consistent error handling
3. **Pagination**: Always handle `pagination` object in paginated responses
4. **Timestamps**: All timestamps are in ISO 8601 format
5. **Currency**: All monetary values are in INR (₹)

---

**Last Updated**: January 2024
