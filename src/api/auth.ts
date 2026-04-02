import { getAPI } from './client';
import {
  APIResponse,
  User,
  StudentProfile,
  EmployerProfile,
  RegisterFormData,
  LoginFormData,
  OTPResponse,
  OTPVerificationData,
} from '@mytypes/index';

/**
 * Auth Service - Handles all authentication API calls
 */

export const authAPI = {
  /**
   * Register a new user
   */
  register: async (data: RegisterFormData): Promise<APIResponse<OTPResponse>> => {
    const api = await getAPI();
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (data: OTPVerificationData): Promise<APIResponse<OTPResponse>> => {
    const api = await getAPI();
    const response = await api.post('/api/auth/verify-otp', data);
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginFormData): Promise<APIResponse<OTPResponse>> => {
    const api = await getAPI();
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<APIResponse<User>> => {
    const api = await getAPI();
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  /**
   * Logout
   */
  logout: async (): Promise<APIResponse<null>> => {
    const api = await getAPI();
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  /**
   * Resend OTP
   */
  resendOTP: async (email: string): Promise<APIResponse<null>> => {
    const api = await getAPI();
    const response = await api.post('/api/auth/resend-otp', { email });
    return response.data;
  },
};

/**
 * User Service - Handles user profile API calls
 */

export const userAPI = {
  /**
   * Get student profile
   */
  getStudentProfile: async (userId?: string): Promise<APIResponse<StudentProfile>> => {
    const api = await getAPI();
    const url = userId ? `/api/users/student/${userId}` : '/api/users/student/me';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Update student profile
   */
  updateStudentProfile: async (
    data: Partial<StudentProfile>
  ): Promise<APIResponse<StudentProfile>> => {
    const api = await getAPI();
    const response = await api.put('/api/users/student/me', data);
    return response.data;
  },

  /**
   * Get employer profile
   */
  getEmployerProfile: async (userId?: string): Promise<APIResponse<EmployerProfile>> => {
    const api = await getAPI();
    const url = userId ? `/api/users/employer/${userId}` : '/api/users/employer/me';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Update employer profile
   */
  updateEmployerProfile: async (
    data: Partial<EmployerProfile>
  ): Promise<APIResponse<EmployerProfile>> => {
    const api = await getAPI();
    const response = await api.put('/api/users/employer/me', data);
    return response.data;
  },

  /**
   * Upload avatar (backend expects PUT /api/users/profile)
   */
  uploadAvatar: async (formData: FormData): Promise<APIResponse<{ avatar: string }>> => {
    const api = await getAPI();
    // some backends require this call to be a PUT to /api/users/profile
    // using multipart/form-data for file upload
    const response = await api.put('/api/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Add education
   */
  addEducation: async (data: any): Promise<APIResponse<any>> => {
    const api = await getAPI();
    const response = await api.post('/api/users/student/education', data);
    return response.data;
  },

  /**
   * Update education
   */
  updateEducation: async (educationId: string, data: any): Promise<APIResponse<any>> => {
    const api = await getAPI();
    const response = await api.put(`/api/users/student/education/${educationId}`, data);
    return response.data;
  },

  /**
   * Delete education
   */
  deleteEducation: async (educationId: string): Promise<APIResponse<null>> => {
    const api = await getAPI();
    const response = await api.delete(`/api/users/student/education/${educationId}`);
    return response.data;
  },

  /**
   * Add experience
   */
  addExperience: async (data: any): Promise<APIResponse<any>> => {
    const api = await getAPI();
    const response = await api.post('/api/users/student/experience', data);
    return response.data;
  },

  /**
   * Update experience
   */
  updateExperience: async (experienceId: string, data: any): Promise<APIResponse<any>> => {
    const api = await getAPI();
    const response = await api.put(`/api/users/student/experience/${experienceId}`, data);
    return response.data;
  },

  /**
   * Delete experience
   */
  deleteExperience: async (experienceId: string): Promise<APIResponse<null>> => {
    const api = await getAPI();
    const response = await api.delete(`/api/users/student/experience/${experienceId}`);
    return response.data;
  },

  /**
   * Update skills
   */
  updateSkills: async (skills: string[]): Promise<APIResponse<StudentProfile>> => {
    const api = await getAPI();
    const response = await api.put('/api/users/student/skills', { skills });
    return response.data;
  },

  /**
   * Update user profile (for completing profile after registration)
   * Note: This uses the student endpoint for general profile updates.
   * For employer-specific updates, use updateEmployerProfile instead.
   */
  updateProfile: async (data: any): Promise<APIResponse<User>> => {
    const api = await getAPI();
    // Default to student endpoint; use updateStudentProfile or updateEmployerProfile for role-specific updates
    const response = await api.put('/api/users/student/me', data);
    return response.data;
  },
};
