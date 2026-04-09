import React, { createContext, useContext, useState, useCallback } from 'react';
import { StudentProfile, EmployerProfile } from '@mytypes/index';
import { userAPI, walletAPI } from '@api/index';
import { useAuth } from './AuthContext';

interface UserContextType {
  // Student data
  studentProfile: StudentProfile | null;
  isLoadingStudent: boolean;
  studentError: string | null;

  // Employer data
  employerProfile: EmployerProfile | null;
  isLoadingEmployer: boolean;
  employerError: string | null;

  // Actions
  fetchStudentProfile: (userId?: string) => Promise<void>;
  fetchEmployerProfile: (userId?: string) => Promise<void>;
  updateStudentProfile: (data: Partial<StudentProfile>) => Promise<void>;
  updateEmployerProfile: (data: Partial<EmployerProfile>) => Promise<void>;
  uploadAvatar: (uri: string, type: string, name: string) => Promise<string>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, registrationData } = useAuth();

  // Student profile state
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Employer profile state
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
  const [isLoadingEmployer, setIsLoadingEmployer] = useState(false);
  const [employerError, setEmployerError] = useState<string | null>(null);

  const { logout } = useAuth();

  const fetchStudentProfile = useCallback(async (userId?: string) => {
    try {
      setIsLoadingStudent(true);
      setStudentError(null);
      const response = await userAPI.getStudentProfile(userId);

      console.log('Student Profile API Response:', response);

      if (response.success && response.data) {
        let profile = response.data;
        try {
          const balRes = await walletAPI.getBalance();
          if (balRes?.success && balRes?.data && typeof balRes.data.balance === 'number') {
            profile.walletBalance = balRes.data.balance;
            console.log('🔢 Fetched wallet balance and merged into profile:', profile.walletBalance);
          }
        } catch (err) {
          console.warn('Could not fetch wallet balance while loading profile:', err);
        }
        console.log('📋 Fetched Profile:', profile);
        console.log('📝 Registration Data available:', registrationData ? 'YES' : 'NO');
        
        // Inject registration data if some fields are still empty
        if (registrationData) {
          console.log('🔄 Merging registration data into profile...');
          
          // Merge skills
          const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
          if (registrationData.skills && !hasSkills) {
            profile.skills = Array.isArray(registrationData.skills)
              ? registrationData.skills
              : registrationData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
            console.log('✅ Merged skills:', profile.skills);
          }
          
          // Merge education
          const hasEducation = Array.isArray(profile.education) && profile.education.length > 0;
          if (registrationData.education && !hasEducation) {
            profile.education = [registrationData.education];
            console.log('✅ Merged education:', profile.education);
          }
          
          // Merge location
          if (registrationData.location) {
            const loc = registrationData.location;
            if (!profile.city && loc.city) profile.city = loc.city;
            if (!profile.state && loc.state) profile.state = loc.state;
            if (!profile.country && loc.country) profile.country = loc.country;
            console.log('✅ Merged location:', { city: profile.city, state: profile.state, country: profile.country });
          }
          
          // Merge age
          if (registrationData.age && !profile.age) {
            profile.age = registrationData.age;
            console.log('✅ Merged age:', profile.age);
          }
        }
        
        // Robust Location Safeguard: Ensure city/state/country are at the root level
        if (profile.location && typeof profile.location === 'object') {
          if (!profile.city) profile.city = profile.location.city;
          if (!profile.state) profile.state = profile.location.state;
          if (!profile.country) profile.country = profile.location.country;
        }

        console.log('📦 Final Profile to set:', profile);
        setStudentProfile(profile);
      } else {
        throw new Error(response.message || 'Failed to fetch student profile');
      }
    } catch (error: any) {
      console.log('Student Profile Fetch Error:', error);

      // Handle 401 - unauthorized token
      if (
        error?.status === 401 ||
        error?.response?.status === 401 ||
        (typeof error?.message === 'string' && error.message.toLowerCase().includes('invalid token'))
      ) {
        console.warn('Unauthorized or invalid token while fetching student profile. Logging out.');
        try {
          await logout();
        } catch (logoutError) {
          console.error('Error during logout on unauthorized response:', logoutError);
        }
        return;
      }

      // Handle 404 - endpoint not implemented yet, use default data
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn('Student profile endpoint not found (404) - using default data');
        if (user?.id) {
          // try to fill from registration data if available
          const reg = registrationData || null;
          let skills: string[] = [];
          let education: any[] = [];
          let city = '';
          let state = '';
          let country = '';
          let age: number | undefined;
          if (reg) {
            if (reg.skills) {
              skills = Array.isArray(reg.skills) ? reg.skills : reg.skills.split(',').map((s: string) => s.trim());
            }
            if (reg.education) {
              // if it's string, keep as single entry
              education = Array.isArray(reg.education) ? reg.education : [reg.education];
            }
            if (reg.location) {
              city = reg.location.city || '';
              state = reg.location.state || '';
              country = reg.location.country || '';
            }
            if (reg.age) {
              age = reg.age;
            }
          }
          const defaultProfile: StudentProfile = {
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            avatar: null,
            bio: '',
            location: city,
            skills,
            education,
            experience: [],
            skillScore: 0,
            walletBalance: 0,
            completedJobsCount: 0,
            // included fields for validation
            age,
            city,
            state,
            country,
          };
          setStudentProfile(defaultProfile);
          return;
        }
      }
      const message = error.response?.data?.message || error.message || 'Unknown error';
      setStudentError(message);
    } finally {
      setIsLoadingStudent(false);
    }
  }, [user, registrationData]);

  const fetchEmployerProfile = useCallback(async (userId?: string) => {
    try {
      setIsLoadingEmployer(true);
      setEmployerError(null);
      const response = await userAPI.getEmployerProfile(userId);

      console.log('Employer Profile API Response:', response);

      if (response.success && response.data) {
        let profile = response.data;

        // Merge registration data for employer in case backend returns incomplete profile
        if (registrationData) {
          const reg = registrationData as any;
          if (reg.businessName && !profile.businessName) profile.businessName = reg.businessName;
          if (reg.businessType && !profile.businessType) profile.businessType = reg.businessType;
          if (reg.businessLocation && !profile.businessLocation) profile.businessLocation = reg.businessLocation;
        }

        setEmployerProfile(profile);
      } else {
        throw new Error(response.message || 'Failed to fetch employer profile');
      }
    } catch (error: any) {
      console.log('Employer Profile Fetch Error:', error);

      // Handle 401 - unauthorized token
      if (
        error?.status === 401 ||
        error?.response?.status === 401 ||
        (typeof error?.message === 'string' && error.message.toLowerCase().includes('invalid token'))
      ) {
        console.warn('Unauthorized or invalid token while fetching employer profile. Logging out.');
        try {
          await logout();
        } catch (logoutError) {
          console.error('Error during logout on unauthorized response:', logoutError);
        }
        return;
      }

      // Handle 404 - endpoint not implemented yet, use default data
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn('Employer profile endpoint not found (404) - using default data');
        if (user?.id) {
          const defaultProfile: EmployerProfile = {
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            businessName: (registrationData as any)?.businessName || '',
            businessType: (registrationData as any)?.businessType || '',
            businessLocation: (registrationData as any)?.businessLocation || { city: '', state: '' },
            avatar: null,
            bio: '',
            website: '',
            walletBalance: 0,
            jobsPostedCount: 0,
            activeJobsCount: 0,
          };
          setEmployerProfile(defaultProfile);
          return;
        }
      }
      const message = error.response?.data?.message || error.message || 'Unknown error';
      setEmployerError(message);
    } finally {
      setIsLoadingEmployer(false);
    }
  }, [user, registrationData]);

  const updateStudentProfile = useCallback(async (data: Partial<StudentProfile>) => {
    try {
      setIsLoadingStudent(true);
      setStudentError(null);
      const response = await userAPI.updateStudentProfile(data);

      if (response.success && response.data) {
        setStudentProfile(response.data);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Unknown error';
      setStudentError(message);
      throw error;
    } finally {
      setIsLoadingStudent(false);
    }
  }, []);

  const updateEmployerProfile = useCallback(async (data: Partial<EmployerProfile>) => {
    try {
      setIsLoadingEmployer(true);
      setEmployerError(null);
      const response = await userAPI.updateEmployerProfile(data);

      if (response.success && response.data) {
        setEmployerProfile(response.data);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Unknown error';
      setEmployerError(message);
      throw error;
    } finally {
      setIsLoadingEmployer(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (uri: string, type: string, name: string) => {
    try {
      setIsLoadingStudent(true);
      setStudentError(null);

      const formData = new FormData();
      formData.append('avatar', {
        uri,
        type,
        name,
      } as any);

      const response = await userAPI.uploadAvatar(formData);

      if (response.success && response.data) {
        // Update local profiles
        if (studentProfile) {
          setStudentProfile({ ...studentProfile, avatar: response.data.avatar });
        }
        if (employerProfile) {
          setEmployerProfile({ ...employerProfile, avatar: response.data.avatar });
        }
        return response.data.avatar;
      } else {
        throw new Error(response.message || 'Failed to upload avatar');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Unknown error';
      setStudentError(message);
      throw error;
    } finally {
      setIsLoadingStudent(false);
    }
  }, [studentProfile, employerProfile]);

  const refreshProfile = useCallback(async () => {
    if (user?.role === 'student') {
      await fetchStudentProfile();
    } else if (user?.role === 'employer') {
      await fetchEmployerProfile();
    }
  }, [user, fetchStudentProfile, fetchEmployerProfile]);

  // If registration data becomes available after the provider mounted (e.g. user just registered),
  // try fetching/merging the profile so profile fields filled during registration appear automatically.
  React.useEffect(() => {
    if (user?.role === 'student' && registrationData) {
      // fetchStudentProfile will merge registration data into the profile if fields are missing
      fetchStudentProfile();
    }
  }, [registrationData, user, fetchStudentProfile]);

  const value: UserContextType = {
    studentProfile,
    isLoadingStudent,
    studentError,
    employerProfile,
    isLoadingEmployer,
    employerError,
    fetchStudentProfile,
    fetchEmployerProfile,
    updateStudentProfile,
    updateEmployerProfile,
    uploadAvatar,
    refreshProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
