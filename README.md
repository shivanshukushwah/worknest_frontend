# Worknest Mobile App

A production-ready React Native mobile application for the Worknest student-employer job marketplace.

## Features

### Authentication
- JWT-based authentication
- Phone OTP verification
- Secure token storage with Expo SecureStore
- Role-based access (Student/Employer)

### Job Management
- Offline jobs (first-come-first-serve)
- Online jobs (profile-based evaluation)
- Job application tracking
- Application status monitoring
- Employer job dashboard

### Profile Management
- Student profile with skills, education, experience
- Skill score (read-only)
- Employer business profile
- Avatar upload
- Wallet balance display

### Wallet & Payments
- Wallet balance display
- Transaction history
- Withdraw requests
- Razorpay integration

### Additional Features
- Push notifications
- In-app notifications
- Job-based reviews
- Escrow visualization

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Axios** for API calls
- **Context API** for state management
- **Expo SecureStore** for JWT storage
- **Expo Notifications** for push notifications
- **Clean UI** with React Native StyleSheet

## Project Structure

```
src/
├── api/              # API client & services
├── screens/          # Screen components
├── components/       # Reusable UI components
├── navigation/       # Navigation configuration
├── context/          # Context providers
├── hooks/            # Custom hooks
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── assets/           # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

```bash
npm install
```

### Development

```bash
# Start development server
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Build

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## API Integration

Base URL: `https://worknest-backend-5c3a.onrender.com`

The app uses Axios with interceptors for:
- Automatic JWT token injection
- Error handling
- Request/response logging

## Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_API_URL=https://worknest-backend-5c3a.onrender.com
```

## Authentication Flow

1. Splash screen checks for existing JWT token
2. If token exists, user goes directly to app
3. If no token, user goes to Register/Login screens
4. After OTP verification, JWT is stored securely
5. Token is automatically attached to all API requests

## Key Implementation Details

### Role-Based Navigation
The app dynamically switches between student and employer tabs based on user role stored in context.

### Job Applications
- Offline jobs: Max applications = positionsRequired × 3
- Online jobs: Max applications = positionsRequired × 10, shortlist = positionsRequired × 3

### Skill Score
Display-only on frontend; backend calculates all values.

### Wallet
Read-only on frontend; all balance data comes from backend.

## Production Deployment

1. Configure EAS build settings
2. Generate signing certificates
3. Build for iOS and Android
4. Submit to app stores

## Development Guidelines

- Never fake data; always fetch from backend
- All calculations (wallet, score) are backend-only
- Components must be reusable and well-typed
- Follow clean code principles
- Maintain TypeScript strict mode

## Support

For issues or questions, contact the development team.
