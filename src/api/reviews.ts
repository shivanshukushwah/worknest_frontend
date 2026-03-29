import { getAPI } from './client';
import { APIResponse, PaginatedResponse, JobReview, ReviewStats } from '@mytypes/index';

/**
 * Review Service - Handles job-based reviews
 */

export const reviewAPI = {
  /**
   * Create a review for a job
   */
  createReview: async (jobId: string, data: any): Promise<APIResponse<JobReview>> => {
    const api = await getAPI();
    const response = await api.post(`/api/reviews/job/${jobId}`, data);
    return response.data;
  },

  /**
   * Get reviews for a user
   */
  getUserReviews: async (
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<JobReview>> => {
    const api = await getAPI();
    const response = await api.get(`/api/reviews/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get reviews for a job
   */
  getJobReviews: async (
    jobId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<JobReview>> => {
    const api = await getAPI();
    const response = await api.get(`/api/reviews/job/${jobId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get review stats for a user
   */
  getUserReviewStats: async (userId: string): Promise<APIResponse<ReviewStats>> => {
    const api = await getAPI();
    const response = await api.get(`/api/reviews/user/${userId}/stats`);
    return response.data;
  },

  /**
   * Update review (employer response)
   */
  updateReview: async (reviewId: string, data: any): Promise<APIResponse<JobReview>> => {
    const api = await getAPI();
    const response = await api.put(`/api/reviews/${reviewId}`, data);
    return response.data;
  },

  /**
   * Get my reviews (received)
   */
  getMyReviews: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<JobReview>> => {
    const api = await getAPI();
    const response = await api.get(`/api/reviews/me?page=${page}&limit=${limit}`);
    return response.data;
  },
};
