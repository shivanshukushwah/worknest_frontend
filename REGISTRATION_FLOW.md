# Registration & OTP Flow Documentation

## Overview

This document outlines the complete registration and OTP verification flow for the Worknest application, including role-specific field requirements and wallet auto-creation.

---

## 1. Registration Endpoint

### POST /api/auth/register

Register a new user with role-specific fields.

#### Common Fields (All Roles)
- `name` (required): User's full name
- `email` (required): Email address (unique per role)
- `phone` (required): Phone number (unique per role)
- `password` (required): Password
- `confirmPassword` (required): Password confirmation
- `role` (required): One of `student`, `worker`, or `employer`

#### Student-Specific Fields
- `age` (required): Student's age
- `location` (required object):
  - `city`: City
  - `state`: State/Province
  - `country`: Country
- `skills` (required array): Array of skill strings
- `education` (required): Education background (string for registration, detailed objects added later)

#### Worker-Specific Fields
- `age` (required): Worker's age
- `location` (required object):
  - `city`: City
  - `state`: State/Province
  - `country`: Country
- `skills` (required array): Array of skill strings (e.g., ["plumbing", "carpentry"])
- `experience` (required): Years of experience or experience summary

#### Employer-Specific Fields
- `businessName` (required): Name of the business
- `businessType` (required): Type of business (free text, e.g., "IT", "Service", "Manufacturing")
- `businessLocation` (required): Business location

### Example Requests

#### Student Registration
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123",
  "role": "student",
  "age": 22,
  "location": {
    "city": "New Delhi",
    "state": "Delhi",
    "country": "India"
  },
  "skills": ["python", "javascript", "web design"],
  "education": "B.Tech Computer Science"
}
```

#### Worker Registration
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+919876543211",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123",
  "role": "worker",
  "age": 28,
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India"
  },
  "skills": ["plumbing", "carpentry", "electrical"],
  "experience": "5 years"
}
```

#### Employer Registration
```json
{
  "name": "ABC Company",
  "email": "company@example.com",
  "phone": "+919876543212",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123",
  "role": "employer",
  "businessName": "ABC Solutions Pvt Ltd",
  "businessType": "IT Services",
  "businessLocation": "Bangalore, Karnataka"
}
```

### Response (OTP Sent)
```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": {
    "userId": "user_id_here",
    "email": "user@example.com"
  }
}
```

**Note**: Register endpoint does NOT return a token. The user must verify OTP first.

---

## 2. Uniqueness Rules

- **Email**: Unique per role (email + role compound uniqueness)
- **Phone**: Unique per role (phone + role compound uniqueness)
- **Same email/phone can be used across different roles**
  - Example: `john@example.com` can register as both student and employer

---

## 3. OTP Verification Endpoint

### POST /api/auth/verify-otp

Verify the OTP sent to the email and obtain authentication token.

#### Request
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Response (Success)
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "phone": "+919876543210",
      "role": "student",
      "isPhoneVerified": true,
      "avatar": null,
      "createdAt": "2026-02-27T10:00:00Z"
    }
  }
}
```

---

## 4. Wallet Auto-Creation

After successful OTP verification, the server:

1. **Checks profile completeness** using rules defined in `profileValidation.js`
2. **If profile is complete**: Automatically creates a Wallet for the user
3. **If profile is incomplete**: Client must complete the profile using the update profile endpoint

### Profile Completeness Rules

**For Student**:
- ✅ Phone verified
- ✅ Age provided
- ✅ Location (city, state, country)
- ✅ Skills added
- ✅ Education added

**For Worker**:
- ✅ Phone verified
- ✅ Age provided
- ✅ Location (city, state, country)
- ✅ Skills added
- ✅ Experience provided

**For Employer**:
- ✅ Phone verified
- ✅ Business details (name, type, location)

**Note**: Since registration includes these fields, the wallet is typically created automatically after OTP verification.

---

## 5. Wallet Endpoints

### GET /api/wallet

Get current user's wallet (authenticated request required).

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "wallet_id",
    "userId": "user_id",
    "balance": 0,
    "currency": "INR",
    "createdAt": "2026-02-27T10:00:00Z"
  }
}
```

### POST /api/wallet

Create a wallet (authenticated request required). If wallet already exists, returns the existing wallet.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request
```json
{}
```

#### Response
```json
{
  "success": true,
  "message": "Wallet created successfully",
  "data": {
    "id": "wallet_id",
    "userId": "user_id",
    "balance": 0,
    "currency": "INR",
    "createdAt": "2026-02-27T10:00:00Z"
  }
}
```

---

## 6. Update User Profile Endpoint

### PUT /api/users/profile

Update user profile after registration if profile was incomplete.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request (Example - Student adding missing fields)
```json
{
  "age": 22,
  "location": {
    "city": "New Delhi",
    "state": "Delhi",
    "country": "India"
  },
  "skills": ["python", "javascript"],
  "education": "B.Tech Computer Science"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "student",
    "isPhoneVerified": true,
    "age": 22,
    "city": "New Delhi",
    "state": "Delhi",
    "country": "India"
  }
}
```

---

## 7. Complete Postman Flow

### Step 1: Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123",
  "role": "student",
  "age": 22,
  "location": {
    "city": "New Delhi",
    "state": "Delhi",
    "country": "India"
  },
  "skills": ["python", "javascript"],
  "education": "B.Tech Computer Science"
}
```

✅ **Response**: OTP sent to email

---

### Step 2: Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

✅ **Response**: JWT token + User data

---

### Step 3: Get Wallet
```
GET /api/wallet
Authorization: Bearer <jwt_token_from_step_2>
```

✅ **Response**: Wallet details (created automatically if profile was complete)

---

## 8. Client-Side Implementation (React Native)

### Registration Component
Located in: [src/app/auth/register.tsx](src/app/auth/register.tsx)

**Features**:
- Role selection (Student, Worker, Employer)
- Dynamic form fields based on role
- Validation of all fields
- Proper payload structure
- Error handling

### OTP Verification Component
Located in: [src/app/auth/otp-verification.tsx](src/app/auth/otp-verification.tsx)

**Features**:
- OTP input
- Resend OTP functionality
- Token storage in secure storage
- Automatic navigation to dashboard if wallet exists

### API Methods

#### In [src/api/auth.ts](src/api/auth.ts):
```typescript
authAPI.register(data)        // POST /api/auth/register
authAPI.verifyOTP(data)       // POST /api/auth/verify-otp
userAPI.updateProfile(data)   // PUT /api/users/profile
```

#### In [src/api/wallet.ts](src/api/wallet.ts):
```typescript
walletAPI.getWallet()         // GET /api/wallet
walletAPI.createWallet()      // POST /api/wallet
```

---

## 9. Context Flow (AuthContext)

### Register Flow
1. User fills form and submits
2. `authAPI.register()` sends data to server
3. Server returns `{ userId, email }` (no token yet)
4. AuthContext stores pending email
5. Navigate to OTP verification screen

### OTP Verification Flow
1. User enters OTP
2. `authAPI.verifyOTP()` sends email + OTP
3. Server verifies and returns token + user
4. AuthContext stores token (in SecureStore) and user
5. AuthContext detects user is authenticated
6. Navigate to home/dashboard

### Wallet Check Flow
1. After OTP verification, navigate to `/wallet` or use `walletAPI.getWallet()`
2. If wallet exists: Profile was complete
3. If wallet doesn't exist: Navigate to complete profile form

---

## 10. Error Handling

### Register Errors
- Email already exists for this role: `409 Conflict`
- Phone already exists for this role: `409 Conflict`
- Invalid email format: `400 Bad Request`
- Weak password: `400 Bad Request`

### OTP Verification Errors
- Invalid OTP: `401 Unauthorized`
- OTP expired: `401 Unauthorized`
- Email not found: `404 Not Found`

---

## 11. Key Points

✅ **Profile fields included in registration** ensure wallet can auto-create
✅ **Compound uniqueness** (email+role, phone+role) allows reuse across roles
✅ **Automatic wallet creation** for complete profiles
✅ **Secure token storage** using `expo-secure-store`
✅ **Role-specific validation** in form and API
✅ **Clear error messages** for user guidance

---

## 12. Updated Frontend Components

### register.tsx
- Added age field for Student and Worker
- Added skills field for Student and Worker
- Added education field for Student
- Updated location structure for all roles
- Proper payload construction per role
- Comprehensive validation

### Types (types/index.ts)
- Updated `RegisterFormData` interface with all fields
- Added `confirmPassword` to registration
- Added optional role-specific fields

### API Methods
- Added `userAPI.updateProfile()` for completing profile
- Added `walletAPI` methods for wallet operations

---

## Summary Table

| Field | Student | Worker | Employer |
|-------|---------|--------|----------|
| name | ✅ | ✅ | ✅ |
| email | ✅ | ✅ | ✅ |
| phone | ✅ | ✅ | ✅ |
| password | ✅ | ✅ | ✅ |
| confirmPassword | ✅ | ✅ | ✅ |
| age | ✅ | ✅ | ❌ |
| location | ✅ | ✅ | ❌ |
| skills | ✅ | ✅ | ❌ |
| education | ✅ | ❌ | ❌ |
| experience | ❌ | ✅ | ❌ |
| businessName | ❌ | ❌ | ✅ |
| businessType | ❌ | ❌ | ✅ |
| businessLocation | ❌ | ❌ | ✅ |

