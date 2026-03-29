import { getAPI } from './client';
import {
  APIResponse,
  PaginatedResponse,
  Wallet,
  Transaction,
  WithdrawalRequest,
} from '@mytypes/index';

/**
 * Wallet Service - Handles wallet and payment operations
 */

export const walletAPI = {
  /**
   * Get wallet details
   */
  getWallet: async (): Promise<APIResponse<Wallet>> => {
    const api = await getAPI();
    const response = await api.get('/api/wallet');
    return response.data;
  },

  /**
   * Get wallet balance
   */
  getBalance: async (): Promise<APIResponse<{ balance: number }>> => {
    const api = await getAPI();
    const response = await api.get('/api/wallet/balance');
    return response.data;
  },

  /**
   * Get transaction history
   */
  getTransactions: async (
    page: number = 1,
    limit: number = 10,
    filters?: { type?: string; status?: string }
  ): Promise<PaginatedResponse<Transaction>> => {
    const api = await getAPI();
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/api/wallet/transactions?${params.toString()}`);
    return response.data;
  },

  /**
   * Create withdrawal request
   */
  createWithdrawalRequest: async (data: any): Promise<APIResponse<WithdrawalRequest>> => {
    const api = await getAPI();
    const response = await api.post('/api/wallet/withdraw', data);
    return response.data;
  },

  /**
   * Get withdrawal requests
   */
  getWithdrawalRequests: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<WithdrawalRequest>> => {
    const api = await getAPI();
    const response = await api.get(`/api/wallet/withdrawals?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get withdrawal request details
   */
  getWithdrawalById: async (withdrawalId: string): Promise<APIResponse<WithdrawalRequest>> => {
    const api = await getAPI();
    const response = await api.get(`/api/wallet/withdrawals/${withdrawalId}`);
    return response.data;
  },

  /**
   * Initiate Razorpay deposit
   */
  initiateDeposit: async (amount: number): Promise<APIResponse<any>> => {
    const api = await getAPI();
    const response = await api.post('/api/wallet/deposit/initiate', { amount });
    return response.data;
  },

  /**
   * Verify Razorpay payment
   */
  verifyPayment: async (data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }): Promise<APIResponse<Wallet>> => {
    const api = await getAPI();
    const response = await api.post('/api/wallet/deposit/verify', data);
    return response.data;
  },
};
