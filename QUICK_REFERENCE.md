# Quick Reference - Registration Flow

## 📋 Files Modified

| File | Changes |
|------|---------|
| [src/types/index.ts](src/types/index.ts) | Updated `RegisterFormData` interface |
| [src/app/auth/register.tsx](src/app/auth/register.tsx) | Complete form redesign with all fields |
| [src/api/auth.ts](src/api/auth.ts) | Added `userAPI.updateProfile()` method |
| [src/api/wallet.ts](src/api/wallet.ts) | Already complete with all endpoints |

---

## 🔄 Registration Flow

```
1. User fills registration form (role-specific)
   ↓
2. POST /api/auth/register
   ↓
3. Server sends OTP to email
   ↓
4. Client navigates to OTP verification
   ↓
5. POST /api/auth/verify-otp
   ↓
6. Server verifies + checks profile completeness
   ↓
7. If complete: Auto-create wallet
   If incomplete: Client must call PUT /api/users/profile
   ↓
8. GET /api/wallet to confirm wallet exists
   ↓
9. Navigate to home/dashboard
```

---

## 📱 Field Requirements

### Student
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "confirmPassword": "string",
  "role": "student",
  "age": number,
  "location": {
    "city": "string",
    "state": "string",
    "country": "string"
  },
  "skills": ["string"],
  "education": "string"
}
```

### Worker
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "confirmPassword": "string",
  "role": "worker",
  "age": number,
  "location": {
    "city": "string",
    "state": "string",
    "country": "string"
  },
  "skills": ["string"],
  "experience": "string"
}
```

### Employer
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "confirmPassword": "string",
  "role": "employer",
  "businessName": "string",
  "businessType": "string",
  "businessLocation": "string"
}
```

---

## 🎯 API Endpoints

### Registration
```
POST /api/auth/register
Content-Type: application/json
Body: RegisterFormData
Response: { success, data: { userId, email } }
```

### OTP Verification
```
POST /api/auth/verify-otp
Content-Type: application/json
Body: { email, otp }
Response: { success, data: { token, user } }
```

### Update Profile (if needed)
```
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json
Body: { age, location, skills, ... }
Response: { success, data: User }
```

### Wallet Operations
```
GET /api/wallet
Authorization: Bearer <token>
Response: { success, data: Wallet }

POST /api/wallet
Authorization: Bearer <token>
Response: { success, data: Wallet }
```

---

## 🔐 Uniqueness Rules

- **Email**: Unique per role
- **Phone**: Unique per role
- **Different roles can share the same email/phone**

Example:
- `john@example.com` → Student
- `john@example.com` → Employer (allowed!)

---

## ✅ Profile Completeness

### Student Complete if:
- ✅ Phone verified
- ✅ Age provided
- ✅ Location (city, state, country)
- ✅ Skills added
- ✅ Education added

### Worker Complete if:
- ✅ Phone verified
- ✅ Age provided
- ✅ Location (city, state, country)
- ✅ Skills added
- ✅ Experience provided

### Employer Complete if:
- ✅ Phone verified
- ✅ Business details (name, type, location)

---

## 🚀 Client-Side Implementation

### Context (AuthContext)
```typescript
// After registration
await authAPI.register(payload)
// → Sets isOTPPending = true, pendingEmail = email

// After OTP verification
await authAPI.verifyOTP({ email, otp })
// → Sets token, user, isOTPPending = false
// → Auto navigates to home if authenticated
```

### Hooks
```typescript
const { register, verifyOTP, user, isLoading, isOTPPending } = useAuth()
```

### Components
- **register.tsx** - Registration form with role selection
- **otp-verification.tsx** - OTP input and verification
- **layout.tsx** - Auto-navigation based on auth state

---

## 💾 Storage

Secure Storage (expo-secure-store):
- `worknest_token` - JWT token
- `worknest_user` - User data
- `worknest_pending_email` - Email pending OTP (cleared after verification)

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 409 Conflict | Email/phone exists for role | Use different email/phone |
| 400 Bad Request | Invalid password strength | Use stronger password |
| 400 Bad Request | Missing required field | Check all role-specific fields |
| 401 Unauthorized | Invalid OTP | Request new OTP and try again |
| 401 Unauthorized | OTP expired | Request new OTP |

---

## 🧪 Test Flow

1. **Postman Test**:
   - POST /api/auth/register (with all fields)
   - POST /api/auth/verify-otp (with OTP from email)
   - GET /api/wallet (confirm wallet created)

2. **App Test**:
   - Register in app
   - Check email for OTP
   - Verify OTP in app
   - Confirm wallet appears in app

3. **Edge Cases**:
   - Register with existing email (different role) - Should work
   - Incomplete profile - Should fail wallet creation
   - Invalid OTP - Should show error

---

## 📞 Quick Help

**Q: How do I register with the same email for different roles?**
A: Email + role is unique, so same email with different role is allowed.

**Q: What if registration is incomplete?**
A: Update profile using PUT /api/users/profile, then wallet auto-creates.

**Q: How long is OTP valid?**
A: Check backend (typically 10-15 minutes).

**Q: Can I change my role after registration?**
A: Not in this flow. User needs separate account for different role.

**Q: Is wallet auto-created for all users?**
A: Only if profile is complete at OTP verification time.

---

## 📚 Documentation Links

- [REGISTRATION_FLOW.md](REGISTRATION_FLOW.md) - Full API documentation
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details
- [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md) - Complete verification guide

