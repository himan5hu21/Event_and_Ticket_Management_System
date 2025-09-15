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
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.success && data.data) {
        queryClient.setQueryData(['auth', 'user'], data.data);
      }
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: typeof window !== 'undefined', // Only run on client side
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
