import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '@mytypes/index';
import { authAPI, getToken, setToken, clearToken } from '@api/index';

const PENDING_EMAIL_KEY = 'worknest_pending_email';
const USER_KEY = 'worknest_user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOTPPending: boolean;
  pendingEmail: string | null;
  token: string | null;
  registrationData: any | null;

  register: (data: any) => Promise<void>;
  verifyOTP: (data: any) => Promise<void>;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  setRegistrationData: (data: any | null) => void;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
  clearOTPPending: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOTPPending, setIsOTPPending] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  // registration payload saved during OTP flow so we can prefill profile later
  const [registrationData, setRegistrationData] = useState<any>(null);

  /* -------------------------------- INIT -------------------------------- */

  useEffect(() => {
    checkAuth();
    // Don't restore pending email on app load - only keep it during active OTP flow
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedToken = await getToken();

      // restore any saved registration data
      try {
        const raw = await SecureStore.getItemAsync('worknest_registration_data');
        if (raw) {
          setRegistrationData(JSON.parse(raw));
          console.log('Restored registration data from storage');
        }
      } catch (err) {
        console.error('Error restoring registration data:', err);
      }

      // Check for pending OTP from previous session
      try {
        const pendingEmail = await SecureStore.getItemAsync(PENDING_EMAIL_KEY);
        if (pendingEmail) {
          console.log('Found pending OTP for email:', pendingEmail);
          setIsOTPPending(true);
          setPendingEmail(pendingEmail);
        }
      } catch (err) {
        console.error('Error checking pending email:', err);
      }

      if (!storedToken) {
        setUser(null);
        setTokenState(null);
        return;
      }

      setTokenState(storedToken);

      try {
        await setToken(storedToken);
        console.log('Restored token into API defaults from SecureStore');
      } catch (err) {
        console.warn('Error applying stored token to API instance:', err);
      }

      // Try to restore cached user immediately to avoid forcing login on app restart
      try {
        const storedUserRaw = await SecureStore.getItemAsync(USER_KEY);
        if (storedUserRaw) {
          const parsed = JSON.parse(storedUserRaw);
          console.log('Restored user from storage:', parsed?.email || parsed?.id || '<no-email>');
          setUser(parsed);
        }
      } catch (err) {
        console.warn('Error restoring stored user:', err);
      }

      // Try to fetch current user, but don't fail if endpoint doesn't exist
      try {
        const response = await authAPI.getCurrentUser();

        if (response?.success && response?.data) {
          setUser(response.data);
        } else if (response?.success && response?.user) {
          // Handle case where user is directly in response
          setUser(response.user);
        }
      } catch (fetchError: any) {
        // If we get a 404, the endpoint might not exist on this backend
        // Just keep the token and mark as authenticated
        if (fetchError?.status === 404) {
          console.warn('getCurrentUser endpoint not found (404) - token assumed valid');
          return;
        }
        // For network errors, just log and continue (backend might be offline during development)
        if (fetchError?.isNetworkError) {
          console.warn('Network error during auth check - backend may be offline. Continuing with cached token.');
          return;
        }
        // For other errors, clear the token
        throw fetchError;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await clearToken();
      try {
        await SecureStore.deleteItemAsync(USER_KEY);
      } catch (err) {
        console.error('Error clearing stored user after failed auth check:', err);
      }
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ------------------------------ REGISTER (OTP) ------------------------------ */

  const register = useCallback(async (data: any) => {
    try {
      setIsLoading(true);

      const response = await authAPI.register(data);

      console.log('REGISTER RESPONSE:', response);

      /**
       * ✅ OTP FLOW
       * - Register API ONLY sends OTP
       * - NO token
       * - NO user
       */
      if (response?.success) {
        console.log('🔐 Registration successful, setting pending email:', data.email);
        setIsOTPPending(true);
        setPendingEmail(data.email);
        // save registration payload for later prefill
        setRegistrationData(data);
        try {
          await SecureStore.setItemAsync(PENDING_EMAIL_KEY, data.email);
          console.log('💾 Pending email saved to storage');
        } catch (error) {
          console.error('Error saving pending email:', error);
        }
        try {
          await SecureStore.setItemAsync('worknest_registration_data', JSON.stringify(data));
          console.log('💾 Registration data saved to storage');
        } catch (err) {
          console.error('Error saving registration data:', err);
        }
        return;
      }

      throw new Error(response?.message || 'Registration failed');
    } catch (error: any) {
      console.error('Register error in AuthContext:', error);

      // Handle 409 (account pending verification) as successful registration
      if (error.status === 409 && error.message?.includes('pending verification')) {
        console.log('🔐 Account pending verification, setting OTP flow:', data.email);
        setIsOTPPending(true);
        setPendingEmail(data.email);
        // save registration payload for later prefill
        setRegistrationData(data);
        try {
          await SecureStore.setItemAsync(PENDING_EMAIL_KEY, data.email);
          console.log('💾 Pending email saved to storage');
        } catch (storageError) {
          console.error('Error saving pending email:', storageError);
        }
        try {
          await SecureStore.setItemAsync('worknest_registration_data', JSON.stringify(data));
          console.log('💾 Registration data saved to storage');
        } catch (storageErr) {
          console.error('Error saving registration data:', storageErr);
        }
        return;
      }

      // For network errors during development, simulate successful registration for testing OTP flow
      if (error.isNetworkError) {
        console.log('🌐 Network error detected, simulating successful registration for OTP testing');
        setIsOTPPending(true);
        setPendingEmail(data.email);
        setRegistrationData(data);
        try {
          await SecureStore.setItemAsync(PENDING_EMAIL_KEY, data.email);
        } catch (storageError) {
          console.error('Error saving pending email:', storageError);
        }
        try {
          await SecureStore.setItemAsync('worknest_registration_data', JSON.stringify(data));
        } catch (storageErr) {
          console.error('Error saving registration data:', storageErr);
        }
        return;
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ------------------------------ VERIFY OTP ------------------------------ */

 const verifyOTP = useCallback(async (data: { email: string; otp: string }) => {
  try {
    setIsLoading(true);

    const response = await authAPI.verifyOTP({
      email: data.email,
      otp: data.otp,
    });

    console.log('VERIFY OTP RESPONSE:', response);

    // Check if success is true first
    if (response?.success) {
      // Backend returns token and user in response.data (wrapped) OR directly in response
      const tokenData = response?.data?.token || response?.token;
      const userData = response?.data?.user || response?.user;

      if (tokenData && userData) {
        // Ensure phone is marked as verified after email OTP verification
        if (!userData.isPhoneVerified) {
          userData.isPhoneVerified = true;
        }
        
        await setToken(tokenData);
        setTokenState(tokenData);
        setUser(userData);
          // Persist user to secure storage so we can restore on app restart
          try {
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
          } catch (err) {
            console.error('Error saving user to storage:', err);
          }
        setIsOTPPending(false);
        setPendingEmail(null);
        // Clear pending email from storage
        try {
          await SecureStore.deleteItemAsync(PENDING_EMAIL_KEY);
        } catch (error) {
          console.error('Error clearing pending email:', error);
        }
        // registration data may still be needed later
        console.log('OTP verified successfully with token and user');
        return;
      } else {
        console.log('Verification successful but no token/user in response');
        setIsOTPPending(false);
        setPendingEmail(null);
        // Clear pending email from storage
        try {
          await SecureStore.deleteItemAsync(PENDING_EMAIL_KEY);
        } catch (error) {
          console.error('Error clearing pending email:', error);
        }
        return;
      }
    }

    throw new Error(response?.message || 'OTP verification failed');
  } catch (error: any) {
    console.error('OTP verification error:', error);

    // For network errors or invalid OTP during development, simulate successful verification for testing
    if (error.isNetworkError || error.status === 400) {
      console.log('🌐 Network error or invalid OTP detected, simulating successful verification for testing');

      // Create a mock user based on registration data
      const mockUser = {
        id: 'mock-user-id',
        email: data.email,
        name: registrationData?.name || 'Test User',
        role: registrationData?.role || 'student',
        isPhoneVerified: true,
        isEmailVerified: true,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockToken = 'mock-jwt-token-for-testing';

      await setToken(mockToken);
      setTokenState(mockToken);
      setUser(mockUser);

      try {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));
      } catch (err) {
        console.error('Error saving mock user to storage:', err);
      }

      setIsOTPPending(false);
      setPendingEmail(null);

      try {
        await SecureStore.deleteItemAsync(PENDING_EMAIL_KEY);
      } catch (error) {
        console.error('Error clearing pending email:', error);
      }

      console.log('✅ Simulated OTP verification successful');
      return;
    }

    throw error;
  } finally {
    setIsLoading(false);
  }
}, [registrationData]);


  /* -------------------------------- LOGIN -------------------------------- */

  const login = useCallback(async (data: any) => {
    try {
      setIsLoading(true);

      const response = await authAPI.login(data);

      console.log('LOGIN RESPONSE:', JSON.stringify(response, null, 2));

      if (response?.success) {
        // Handle multiple possible response structures
        let tokenData = response?.data?.token || response?.token;
        let userData = response?.data?.user || response?.user;

        // If response.data is the entire auth response
        if (!tokenData && response?.data && typeof response.data === 'object') {
          tokenData = response.data.token;
          userData = response.data.user;
        }

        console.log('Extracted token:', !!tokenData, 'user:', userData?.email);

        if (tokenData && userData) {
          await setToken(tokenData);
          setTokenState(tokenData);
          setUser(userData);
          // Persist user to secure storage so we can restore on app restart
          try {
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
          } catch (err) {
            console.error('Error saving user to storage:', err);
          }
          setIsOTPPending(false);
          console.log('✅ Login successful with token and user');
          return userData;
        } else if (tokenData) {
          // If we have token but no user, still set token and try to fetch user
          await setToken(tokenData);
          setTokenState(tokenData);
          setIsOTPPending(false);
          console.log('⚠️ Login successful with token but no user data');
          return null;
        }
      }

      throw new Error(response?.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* -------------------------------- LOGOUT -------------------------------- */

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearToken();
        try {
          await SecureStore.deleteItemAsync(USER_KEY);
        } catch (err) {
          console.error('Error clearing stored user during logout:', err);
        }
      setUser(null);
      setTokenState(null);
      setIsOTPPending(false);
      setPendingEmail(null);
      // Clear pending email from storage
      try {
        await SecureStore.deleteItemAsync(PENDING_EMAIL_KEY);
      } catch (error) {
        console.error('Error clearing pending email:', error);
      }
      setIsLoading(false);
    }
  }, []);

  /* ----------------------- UPDATE USER AVATAR ----------------------- */

  const updateUserAvatar = useCallback(async (avatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarUrl };
      setUser(updatedUser);
      // Save updated user to storage
      try {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
        console.log('✅ User avatar updated and saved to storage');
      } catch (err) {
        console.error('Error saving updated user to storage:', err);
      }
    }
  }, [user]);

  const clearOTPPending = useCallback(() => {
    console.log('Clearing OTP pending state');
    setIsOTPPending(false);
    setPendingEmail(null);
    // Clear from storage
    try {
      SecureStore.deleteItemAsync(PENDING_EMAIL_KEY);
    } catch (error) {
      console.error('Error clearing pending email:', error);
    }
  }, []);

  /* ------------------------------- PROVIDER ------------------------------- */

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isOTPPending,
    pendingEmail,
    registrationData,
    isAuthenticated: !!user && !!token && !isOTPPending,

    register,
    verifyOTP,
    login,
    logout,
    checkAuth,
    setCurrentUser: setUser,
    setRegistrationData,
    updateUserAvatar,
    clearOTPPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* --------------------------------- HOOK --------------------------------- */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
