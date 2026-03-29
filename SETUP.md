# Worknest Mobile App - Production Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Expo Project

If this is a fresh project, configure Expo:

```bash
expo login  # Or use prebuild if needed
```

### 3. Environment Setup

Create a `.env` file (already provided with default API URL):

```env
EXPO_PUBLIC_API_URL=https://worknest-backend-5c3a.onrender.com
```

### 4. Development Server

Start the development server:

```bash
npm start

# For specific platforms:
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web Browser
```

## Project Architecture

### Directory Structure

```
src/
├── api/                    # API client & service layers
│   ├── client.ts          # Axios instance with interceptors
│   ├── auth.ts            # Authentication & user services
│   ├── jobs.ts            # Job & application services
│   ├── wallet.ts          # Wallet & payment services
│   ├── reviews.ts         # Review services
│   ├── notifications.ts   # Notification services
│   └── index.ts           # API exports
│
├── app/                   # Navigation & screen structure (Expo Router)
│   ├── _layout.tsx        # Root layout with role-based routing
│   ├── splash.tsx         # Splash screen for auth check
│   ├── auth/              # Authentication screens
│   ├── (student)/         # Student-only screens
│   ├── (employer)/        # Employer-only screens
│   ├── wallet.tsx         # Shared wallet screen
│   ├── notifications.tsx  # Shared notifications
│   └── profile.tsx        # Shared profile
│
├── components/            # Reusable UI components
│   ├── Button.tsx
│   ├── TextField.tsx
│   ├── Card.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Loader.tsx
│   ├── Alert.tsx
│   ├── Screen.tsx
│   ├── List.tsx
│   └── index.ts
│
├── context/              # Global state management
│   ├── AuthContext.tsx   # Authentication state
│   ├── UserContext.tsx   # User profile state
│   ├── NotificationContext.tsx
│   └── index.ts
│
├── hooks/               # Custom React hooks
│   ├── useImagePicker.ts
│   ├── usePagination.ts
│   └── index.ts
│
├── types/              # TypeScript definitions
│   └── index.ts
│
├── utils/              # Utility functions
│   ├── validation.ts   # Form validation
│   ├── formatting.ts   # Date/currency formatting
│   ├── helpers.ts      # General utilities
│   ├── notifications.ts # Notification setup
│   └── index.ts
│
└── assets/             # Static assets
```

## Authentication Flow

1. **Splash Screen**: Checks for existing JWT token
   - If token exists → Direct to app
   - If no token → Redirect to login

2. **Login/Register**: User provides credentials
   - Phone OTP required for registration
   - JWT token returned after OTP verification

3. **Token Storage**: Secure storage with `Expo SecureStore`
   - Tokens never stored in localStorage or AsyncStorage
   - Automatically attached to all API requests

4. **Logout**: Token cleared from SecureStore
   - User redirected to login screen

## API Integration

### Base Setup

All API calls use the axios instance configured in `src/api/client.ts`:

```typescript
// Automatic JWT injection
api.defaults.headers.common.Authorization = `Bearer ${token}`;

// Automatic error handling
// 401 → Clear token and redirect to login
```

### Making API Calls

```typescript
// From any screen/component
import { jobAPI, userAPI } from '@api/index';

const response = await jobAPI.getAllJobs(1, 20);
if (response.success) {
  // Handle data
}
```

## State Management

### Auth Context

Manages authentication state and user session:

```typescript
const { user, token, isAuthenticated, login, logout } = useAuth();
```

### User Context

Manages profile data for students and employers:

```typescript
const { studentProfile, fetchStudentProfile, updateStudentProfile } = useUser();
```

### Notification Context

Manages in-app notifications:

```typescript
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
```

## Important Implementation Notes

### 1. Data Always from Backend

- ❌ Never calculate wallet balance on frontend
- ❌ Never compute skill score locally
- ✅ Always fetch from backend API
- ✅ Display values as-is from API response

### 2. Job Application Limits

- **Offline Jobs**: Max applications = `positionsRequired × 3`
- **Online Jobs**: Max applications = `positionsRequired × 10`
  - Shortlist limit = `positionsRequired × 3`
  - Only employer sees shortlisted applicants

### 3. Profile Requirement for Online Jobs

- Online job applications require `profileUrl`
- Valid domains: LinkedIn, GitHub, Portfolio
- Backend auto-evaluates profiles

### 4. Role-Based Navigation

Navigation automatically switches based on `user.role`:

- **Student**: Jobs, Applications, Wallet, Notifications, Profile
- **Employer**: Post Job, My Jobs, Wallet, Notifications, Profile

### 5. Error Handling

Consistent error handling throughout:

```typescript
try {
  const response = await API_CALL();
  if (response.success) {
    // Handle success
  }
} catch (error) {
  const message = getErrorMessage(error);
  Alert.alert('Error', message);
}
```

## Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

### Configuration

Update `app.json`:

```json
{
  "expo": {
    "name": "Worknest",
    "slug": "worknest",
    "ios": {
      "bundleIdentifier": "com.worknest.app"
    },
    "android": {
      "package": "com.worknest.app"
    }
  }
}
```

## Push Notifications Setup

1. Initialize Expo push notifications:

```typescript
import { initializeNotifications } from '@utils/notifications';

useEffect(() => {
  const setupNotifications = async () => {
    const token = await initializeNotifications();
    if (token) {
      await registerPushToken(token);
    }
  };
  setupNotifications();
}, []);
```

2. Handle incoming notifications:

```typescript
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      handleNotificationResponse(response, (data) => {
        // Navigate or perform action based on notification data
      });
    }
  );

  return () => subscription.remove();
}, []);
```

## Customization Guide

### Adding New Screens

1. Create screen file in appropriate directory
2. Add route to navigation layout
3. Implement screen component
4. Use `Screen` component wrapper

### Adding New API Services

1. Create service file in `src/api/`
2. Export functions from `src/api/index.ts`
3. Use in components via `import { serviceAPI } from '@api/index'`

### Styling

All screens use React Native `StyleSheet`:

- No CSS-in-JS libraries (clean approach)
- Consistent spacing: 8px, 12px, 16px
- Color scheme:
  - Primary: `#007AFF`
  - Success: `#34C759`
  - Danger: `#FF3B30`
  - Background: `#F9F9F9`

## Troubleshooting

### Expo Dev Client Issues

If expo-router issues occur:

```bash
expo prebuild --clean
npm run ios  # or npm run android
```

### Token Issues

Clear stored token manually:

```typescript
import * as SecureStore from 'expo-secure-store';
await SecureStore.deleteItemAsync('worknest_jwt_token');
```

### API Connection Issues

Check environment variable:

```bash
echo $EXPO_PUBLIC_API_URL
# Should output: https://worknest-backend-5c3a.onrender.com
```

## Performance Optimization

- FlatList with proper keyExtractor
- Pagination for large lists
- Image caching via Expo
- Debounced search inputs
- Lazy loading screens

## Security Best Practices

✅ **Implemented**:

- JWT stored in SecureStore (not AsyncStorage)
- HTTPS for all API calls
- Request interceptors for auth
- Error responses don't expose sensitive data
- Form validation on client-side

## Feature Checklist

### Authentication
- [x] Register with phone OTP
- [x] Login with email/password
- [x] JWT token management
- [x] Secure token storage
- [x] Logout functionality

### Student Features
- [x] Browse jobs
- [x] Apply for jobs (offline & online)
- [x] View application status
- [x] Manage profile (skills, education, experience)
- [x] View wallet balance

### Employer Features
- [x] Post jobs (offline & online)
- [x] View job applicants
- [x] Shortlist/hire applicants
- [x] Manage job listings
- [x] View wallet balance

### Shared Features
- [x] Wallet management
- [x] In-app notifications
- [x] Profile management
- [x] Push notifications ready
- [x] Reviews system (backend integrated)

## Next Steps

1. **Testing**: Implement unit and integration tests
2. **Analytics**: Add Sentry or similar for error tracking
3. **Review System**: Complete review creation/display flow
4. **Wallet UI**: Implement Razorpay payment flow
5. **Profile Editing**: Complete form for profile updates

## Support & Maintenance

For issues or updates:
- Check backend API documentation
- Review error logs in Sentry/monitoring tool
- Test with Expo Go before building

---

**Built with ❤️ for the Worknest Community**
