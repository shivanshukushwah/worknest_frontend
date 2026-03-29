import { getAPI } from './client';
import {
  APIResponse,
  PaginatedResponse,
  Job,
  JobApplication,
  ApplicationStatus,
  JobWithApplicationStatus,
} from '@mytypes/index';

/**
 * Job Service - Handles all job-related API calls
 */

export const jobAPI = {
  /**
   * Get all jobs with optional filters
   */
  getAllJobs: async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      type?: string;
      location?: string;
      salary?: { min: number; max: number };
      skills?: string[];
    }
  ): Promise<PaginatedResponse<JobWithApplicationStatus>> => {
    const api = await getAPI();
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters?.type) params.append('type', filters.type);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.salary) {
      params.append('minSalary', filters.salary.min.toString());
      params.append('maxSalary', filters.salary.max.toString());
    }
    if (filters?.skills?.length) {
      params.append('skills', filters.skills.join(','));
    }

    const response = await api.get(`/api/jobs?${params.toString()}`);
    return response.data;
  },

  /**
   * Get job details by ID
   */
  getJobById: async (jobId: string): Promise<APIResponse<JobWithApplicationStatus>> => {
    const api = await getAPI();
    const response = await api.get(`/api/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Get employer's jobs
   */
  getEmployerJobs: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Job>> => {
    const api = await getAPI();
    const response = await api.get(`/api/jobs/employer/my-jobs?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Create a new job
   */
  createJob: async (data: any): Promise<APIResponse<Job>> => {
    const api = await getAPI();
    const payload = { ...data };
    console.log('API createJob payload:', payload);
    const response = await api.post('/api/jobs', payload);
    return response.data;
  },

  /**
   * Update a job
   */
  updateJob: async (jobId: string, data: Partial<Job>): Promise<APIResponse<Job>> => {
    const api = await getAPI();
    const response = await api.put(`/api/jobs/${jobId}`, data);
    return response.data;
  },

  /**
   * Delete a job
   */
  deleteJob: async (jobId: string): Promise<APIResponse<null>> => {
    const api = await getAPI();
    const response = await api.delete(`/api/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Close a job (stop accepting applications)
   */
  closeJob: async (jobId: string): Promise<APIResponse<Job>> => {
    const api = await getAPI();
    const response = await api.post(`/api/jobs/${jobId}/close`);
    return response.data;
  },

  /**
   * Search jobs
   */
  searchJobs: async (query: string, page: number = 1): Promise<PaginatedResponse<Job>> => {
    const api = await getAPI();
    const response = await api.get(`/api/jobs/search?q=${encodeURIComponent(query)}&page=${page}`);
    return response.data;
  },

  /**
   * Get job applications (for employers)
   */
  getJobApplications: async (
    jobId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<JobApplication>> => {
    const api = await getAPI();
    const response = await api.get(
      `/api/jobs/${jobId}/applications?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get shortlisted applications (for online jobs)
   */
  getShortlistedApplications: async (
    jobId: string,
    page: number = 1
  ): Promise<PaginatedResponse<JobApplication>> => {
    const api = await getAPI();
    const response = await api.get(`/api/jobs/${jobId}/shortlisted?page=${page}`);
    return response.data;
  },
};

/**
 * Application Service - Handles job application operations
 */

export const applicationAPI = {
  /**
   * Apply for a job
   */
  applyForJob: async (jobId: string, data: any): Promise<APIResponse<JobApplication>> => {
    const api = await getAPI();
    const response = await api.post(`/api/applications/apply/${jobId}`, data);
    return response.data;
  },

  /**
   * Get student's applications
   */
  getMyApplications: async (
    page: number = 1,
    limit: number = 10,
    filters?: { status?: ApplicationStatus; jobType?: string }
  ): Promise<PaginatedResponse<JobApplication>> => {
    const api = await getAPI();
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters?.status) params.append('status', filters.status);
    if (filters?.jobType) params.append('jobType', filters.jobType);

    const response = await api.get(`/api/jobs/my-applications?${params.toString()}`);
    return response.data;
  },

  /**
   * Get application details
   */
  getApplicationById: async (applicationId: string): Promise<APIResponse<JobApplication>> => {
    const api = await getAPI();
    const response = await api.get(`/api/applications/${applicationId}`);
    return response.data;
  },

  /**
   * Update application status (for employers)
   */
  updateApplicationStatus: async (
    applicationId: string,
    status: ApplicationStatus
  ): Promise<APIResponse<JobApplication>> => {
    const api = await getAPI();
    const response = await api.put(`/api/applications/${applicationId}`, { status });
    return response.data;
  },

  /**
   * Shortlist application (for online jobs)
   */
  shortlistApplication: async (applicationId: string): Promise<APIResponse<JobApplication>> => {
    const api = await getAPI();
    const response = await api.post(`/api/applications/${applicationId}/shortlist`);
    return response.data;
  },

  /**
   * Reject application
   */
  rejectApplication: async (applicationId: string): Promise<APIResponse<null>> => {
    const api = await getAPI();
    const response = await api.post(`/api/applications/${applicationId}/reject`);
    return response.data;
  },

  /**
   * Hire applicant
   */
  hireApplicant: async (applicationId: string): Promise<APIResponse<JobApplication>> => {
    const api = await getAPI();
    const response = await api.post(`/api/applications/${applicationId}/hire`);
    return response.data;
  },
};
