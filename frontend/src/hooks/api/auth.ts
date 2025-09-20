import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LoginData, RegisterData, User, ApiResponse } from '@/lib/schemas';

// Auth API functions
const authApi = {
  login: async (data: LoginData): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/auth/sign-in', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/auth/sign-up', data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/auth/logout');
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me', {
        // Prevent axios from throwing errors for 401 responses
        validateStatus: (status) => status < 500
      });
      
      // If 401, return unauthenticated response
      if (response.status === 401) {
        return { 
          success: false, 
          data: undefined, 
          message: 'Not authenticated'
        } as ApiResponse<User>;
      }
      
      // For successful responses, return the data
      if (response.data?.success && response.data.data) {
        return response.data;
      }
      
      // For other successful status codes but with error response
      return { 
        success: false, 
        data: undefined, 
        message: response.data?.message || 'Failed to fetch user data'
      } as ApiResponse<User>;
    } catch (error) {
      // Only log unexpected errors to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error in getMe:', error);
      }
      return { 
        success: false, 
        data: undefined, 
        message: 'An error occurred while fetching user data' 
      } as ApiResponse<User>;
    }
  },
};

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<User>, Error, LoginData>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.success) {
        // Update the auth user query data
        queryClient.setQueryData<ApiResponse<User>>(['auth', 'user'], {
          success: true,
          data: data.data,
          message: data.message || 'Login successful'
        });
        
        // Invalidate any queries that depend on authentication
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<User>, Error, RegisterData>({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Update the auth user query data with the newly registered user
        queryClient.setQueryData<ApiResponse<User>>(['auth', 'user'], {
          success: true,
          data: data.data,
          message: data.message || 'Registration successful'
        });
        
        // Invalidate any queries that depend on authentication
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse, Error, void>({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Reset the auth user query data
      queryClient.setQueryData<ApiResponse<User>>(['auth', 'user'], {
        success: false,
        data: undefined,
        message: 'Logged out successfully'
      });
      
      // Clear all queries to ensure a clean state
      queryClient.clear();
      
      // Invalidate any queries that depend on authentication
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: () => {
      // Even if the logout API call fails, we still want to clear the auth state
      queryClient.setQueryData<ApiResponse<User>>(['auth', 'user'], {
        success: false,
        data: undefined,
        message: 'Logged out (session may still be active on server)'
      });
    }
  });
};

export const useMe = () => {
  return useQuery<ApiResponse<User>>({
    queryKey: ['auth', 'user'],
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: typeof window !== 'undefined', // Only run on client side
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (data) => data,
  });
};
