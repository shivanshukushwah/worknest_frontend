# Registration Form Structure - Visual Guide

## 🎨 Form Layout

### Common Fields (All Roles)
```
┌─────────────────────────────────┐
│   WORKNEST REGISTRATION         │
├─────────────────────────────────┤
│ Full Name                       │
│ [________________________]       │
│                                 │
│ Email                           │
│ [________________________]       │
│                                 │
│ Phone                           │
│ [________________________]       │
│                                 │
│ Password                    👁  │
│ [________________________]       │
│                                 │
│ Confirm Password            👁  │
│ [________________________]       │
└─────────────────────────────────┘
```

### Role Selection
```
┌─────────────────────────────────┐
│  Which role applies to you?     │
├─────────────────────────────────┤
│ [  Student  ] [ Worker ] [Employer] │
└─────────────────────────────────┘
```

---

## 📱 Student Form

```
┌─────────────────────────────────┐
│  STUDENT PROFILE                │
├─────────────────────────────────┤
│ Age                             │
│ [___]                           │
│                                 │
│ City                            │
│ [________________________]       │
│                                 │
│ State                           │
│ [________________________]       │
│                                 │
│ Country                         │
│ [________________________]       │
│                                 │
│ Skills                          │
│ (comma-separated)               │
│ [____________________]          │
│ Hint: python, javascript, design│
│                                 │
│ Education                       │
│ [________________________]       │
│ Hint: B.Tech Computer Science   │
│                                 │
│ [  Create Account  ]            │
└─────────────────────────────────┘
```

---

## 👷 Worker Form

```
┌─────────────────────────────────┐
│  WORKER PROFILE                 │
├─────────────────────────────────┤
│ Age                             │
│ [___]                           │
│                                 │
│ City                            │
│ [________________________]       │
│                                 │
│ State                           │
│ [________________________]       │
│                                 │
│ Country                         │
│ [________________________]       │
│                                 │
│ Skills                          │
│ (comma-separated)               │
│ [____________________]          │
│ Hint: plumbing, carpentry       │
│                                 │
│ Experience                      │
│ [________________________]       │
│ Hint: 5 years                   │
│                                 │
│ [  Create Account  ]            │
└─────────────────────────────────┘
```

---

## 💼 Employer Form

```
┌─────────────────────────────────┐
│  EMPLOYER PROFILE               │
├─────────────────────────────────┤
│ Business Name                   │
│ [________________________]       │
│                                 │
│ Business Type                   │
│ [________________________]       │
│ Hint: service / IT / manufacturing│
│                                 │
│ Business Location               │
│ [________________________]       │
│                                 │
│ [📍 Pick from Map]              │
│                                 │
│ [  Create Account  ]            │
└─────────────────────────────────┘
```

---

## 🔄 Form Flow

```
Start
  │
  ▼
[Enter Common Fields]
  │
  ▼
[Select Role]
  │
  ├─────────────────┬──────────────┬──────────────┐
  │                 │              │              │
  ▼                 ▼              ▼              ▼
Student          Worker         Employer      Back
  │                 │              │
  ▼                 ▼              ▼
+Age            +Age          +Business Name
+City           +City         +Business Type
+State          +State        +Business Location
+Country        +Country      +Map Picker
+Skills         +Skills
+Education      +Experience
  │                 │              │
  └─────────────────┴──────────────┘
          │
          ▼
    [Create Account]
          │
          ▼
    POST /api/auth/register
          │
          ▼
    [OTP Sent to Email]
          │
          ▼
    [Enter OTP]
          │
          ▼
    POST /api/auth/verify-otp
          │
          ▼
    [Dashboard]
```

---

## 📝 Field Input Types

| Field | Type | Example |
|-------|------|---------|
| Full Name | Text | John Doe |
| Email | Email | john@example.com |
| Phone | Tel | +919876543210 |
| Password | Password | SecurePass@123 |
| Confirm Password | Password | SecurePass@123 |
| Age | Number | 22 |
| City | Text | New Delhi |
| State | Text | Delhi |
| Country | Text | India |
| Skills | Text (CSV) | python, javascript, design |
| Education | Text | B.Tech CS |
| Experience | Text | 5 years |
| Business Name | Text | ABC Corp |
| Business Type | Text | IT Services |
| Business Location | Text / Map | Bangalore |

---

## 🎯 Validation Rules

### Common Fields
```
✓ Name: Required, min 2 chars
✓ Email: Valid email format, unique per role
✓ Phone: Valid phone format, unique per role
✓ Password: Min 8 chars, uppercase, lowercase, number, special char
✓ Confirm Password: Must match password
```

### Student/Worker Fields
```
✓ Age: Number > 0
✓ City: Required
✓ State: Required
✓ Country: Required
✓ Skills: Required, at least 1 skill
```

### Student Only
```
✓ Education: Required
```

### Worker Only
```
✓ Experience: Required
```

### Employer Fields
```
✓ Business Name: Required
✓ Business Type: Required
✓ Business Location: Required
```

---

## 📤 Sample Data Entry

### Student Example
```
Name: Rahul Kumar
Email: rahul@student.com
Phone: +919876543210
Password: MyPass@123
Confirm Password: MyPass@123
Role: Student
Age: 22
City: New Delhi
State: Delhi
Country: India
Skills: python, javascript, react
Education: B.Tech Information Technology
```

### Worker Example
```
Name: Priya Sharma
Email: priya@worker.com
Phone: +919876543211
Password: MyPass@456
Confirm Password: MyPass@456
Role: Worker
Age: 28
City: Mumbai
State: Maharashtra
Country: India
Skills: plumbing, electrical, carpentry
Experience: 5 years
```

### Employer Example
```
Name: ABC Company Ltd
Email: company@abc.com
Phone: +919876543212
Password: MyPass@789
Confirm Password: MyPass@789
Role: Employer
Business Name: ABC Solutions Pvt Ltd
Business Type: IT Services and Consulting
Business Location: Bangalore, Karnataka
```

---

## 📡 Data Flow to Backend

```
Frontend Form
    │
    ▼
JavaScript Object
    │
    ├─────────────────────────────────────┐
    │                                     │
    ▼                                     ▼
Construction              Validation
    │                         │
    └────────────┬────────────┘
               │
               ▼
        JSON Payload
               │
               ▼
    POST /api/auth/register
               │
               ▼
        Backend Processing
```

---

## 🔐 Security Measures

1. **Password Fields**
   - Masked input (dots/asterisks)
   - Eye icon to toggle visibility
   - Real-time strength validation

2. **Phone Uniqueness**
   - Per role uniqueness enforced
   - Compound key: (phone, role)
   - Server-side validation

3. **Email Uniqueness**
   - Per role uniqueness enforced
   - Compound key: (email, role)
   - Server-side validation

4. **OTP Verification**
   - Required before token issued
   - OTP sent to registered email
   - Time-limited (typically 10-15 mins)

5. **Token Storage**
   - Stored in secure storage
   - Encrypted on device
   - Cleared on logout

---

## 🎬 User Journey

```
1. User opens app
   ↓
2. User clicks "Register"
   ↓
3. User enters name, email, phone, password
   ↓
4. User selects role (Student/Worker/Employer)
   ↓
5. Form updates with role-specific fields
   ↓
6. User enters role-specific data
   ↓
7. User taps "Create Account"
   ↓
8. App validates form
   ↓
9. App sends POST /api/auth/register
   ↓
10. Server sends OTP to email
   ↓
11. User navigates to OTP screen
   ↓
12. User enters OTP from email
   ↓
13. User taps "Verify"
   ↓
14. App sends POST /api/auth/verify-otp
   ↓
15. Server verifies + auto-creates wallet
   ↓
16. App navigates to Dashboard
   ↓
17. User can view wallet and profile
```

---

## 🎨 UI Components Used

- **TextField**: Text input fields
- **Button**: Action buttons
- **TouchableOpacity**: Role selector buttons
- **Modal**: Map picker for employer
- **ScrollView**: Form container for overflow
- **KeyboardAvoidingView**: Handle keyboard
- **Animated**: Fade-in animation on load
- **LottieView**: Animated login graphic
- **LinearGradient**: Background gradient
- **Icons**: Eye toggle for passwords

---

## 📏 Responsive Design

```
Portrait Mode (Most Common):
┌─────────────────────┐
│ Form Fields Stacked │
│ Full Width          │
│ Scrollable          │
└─────────────────────┘

Landscape Mode:
┌──────────────────────────────────┐
│ Form Fields Side-by-Side         │
│ Adjusted Padding                 │
│ Still Scrollable                 │
└──────────────────────────────────┘
```

---

## ✨ Special Features

1. **Map Picker**
   - Only for Employer
   - Can pick location from map
   - Or enter manually
   - Uses device location services

2. **Password Strength**
   - Real-time validation
   - Shows requirements
   - Toggle visibility

3. **Role Selection**
   - Clear visual indicators
   - Active role highlighted
   - Instant form update

4. **Lottie Animation**
   - Engaging registration graphic
   - Smooth fade-in effect
   - Professional appearance

---

## 🚀 Performance

- Lightweight component
- Efficient state management
- Keyboard-aware positioning
- Smooth animations
- Fast form validation

