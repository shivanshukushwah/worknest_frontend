import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://worknest-backend-5c3a.onrender.com';
const TOKEN_KEY = 'worknest_jwt_token';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let api: AxiosInstance | null = null;
let initPromise: Promise<AxiosInstance> | null = null;

const initializeAPI = async (): Promise<AxiosInstance> => {
  // If already initialized, return it
  if (api) {
    return api;
  }

  // If initialization is in progress, wait for it
  if (initPromise) {
    return initPromise;
  }

  // Start initialization
  initPromise = (async () => {
    try {
      // Get token from secure store if it exists
      let token: string | null = null;
      try {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      } catch (error) {
        console.error('Error reading token from SecureStore:', error);
      }

      api = axios.create({
        baseURL: API_URL,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      // Request interceptor to add token
      api.interceptors.request.use(
        async (config: CustomAxiosRequestConfig) => {
          try {
            const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
            if (storedToken) {
              config.headers.Authorization = `Bearer ${storedToken}`;
            }
          } catch (error) {
            console.error('Error getting token from SecureStore:', error);
          }
          try {
            const method = (config.method || 'get').toUpperCase();
            const url = config.url || '';
            // Log outgoing request body for debugging job payload issues
            if (method === 'POST' || method === 'PUT') {
              try {
                console.log(`API Request: ${method} ${url} data=`, config.data);
              } catch (err) {
                console.log(`API Request: ${method} ${url} data=[unserializable]`);
              }
            }
          } catch (err) {
            // swallow logging errors
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Response interceptor for error handling
      api.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error) => {
          const originalRequest = error.config as CustomAxiosRequestConfig;

          // Handle 401 Unauthorized
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // Clear token and let app handle redirect to login
            try {
              await SecureStore.deleteItemAsync(TOKEN_KEY);
              if (api?.defaults?.headers?.common) {
                delete api.defaults.headers.common.Authorization;
              }
            } catch (err) {
              console.error('Error clearing token:', err);
            }
          }

          // Log concise error for debugging (avoid logging large objects)
          const status = error.response?.status;
          const apiMessage = error.response?.data?.message || error.message;
          const isNetworkError = !error.response;

          // Don't log 404s for known optional endpoints
          const url = error.config?.url || '';
          const isOptionalEndpoint = 
            url.includes('/api/auth/me') ||
            url.includes('/api/users/student/me') ||
            url.includes('/api/users/employer/me') ||
            url.includes('/api/users/student/') ||
            url.includes('/api/users/employer/') ||
            url.includes('/api/jobs/employer/my-jobs') ||
            url.includes('/api/wallet') ||
            (url.includes('/api/jobs') && status === 404);
          
          // Don't log 400/404 errors - they're expected validation/not-found responses
          if ((status !== 404 && status !== 400) || !isOptionalEndpoint) {
            console.error(
              `API Error: status=${status ?? 'unknown'} message=${apiMessage} network=${isNetworkError}`
            );
          }

          // Reject with a plain Error instance containing small metadata to avoid
          // Metro attempting to serialize large/circular Axios error objects.
          const simpleErr: any = new Error(apiMessage || 'API Error');
          simpleErr.status = status;
          simpleErr.isNetworkError = isNetworkError;

          return Promise.reject(simpleErr);
        }
      );

      return api;
    } catch (error) {
      console.error('Failed to initialize API:', error);
      throw error;
    }
  })();

  return initPromise;
};

export const getAPI = async (): Promise<AxiosInstance> => {
  return initializeAPI();
};

export const setToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    const apiInstance = await getAPI();
    apiInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    const apiInstance = await getAPI();
    delete apiInstance.defaults.headers.common.Authorization;
  } catch (error) {
    console.error('Error clearing token:', error);
    throw error;
  }
};

export { API_URL };
