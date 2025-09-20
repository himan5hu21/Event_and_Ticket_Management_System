import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User, ApiResponse, PaginatedResponse } from '@/lib/schemas';

// User API functions
const userApi = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    verified?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/users', { params });
    const { users, pagination } = response.data.data;
    
    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        items: users,
        totalItems: pagination.total,
        totalPages: pagination.totalPages,
        currentPage: pagination.page,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1
      }
    };
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  verifyUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch(`/users/${id}/verify`);
    return response.data;
  },

  unverifyUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch(`/users/${id}/unverify`);
    return response.data;
  },

  changeUserRole: async (id: string, role: 'customer' | 'admin' | 'event-manager'): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch(`/users/${id}/role`, { role });
    return response.data;
  },
};

// User hooks
type UseUsersParams = {
  page?: number;
  limit?: number;
  role?: string;
  verified?: boolean;
  search?: string;
  organization?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
};

export const useUsers = (params?: UseUsersParams) => {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: ['users', params],
    queryFn: () => userApi.getUsers(params as UseUsersParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      userApi.updateUser(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      if (data.data) {
        queryClient.setQueryData(['users', variables.id], data.data);
      }
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.removeQueries({ queryKey: ['users', userId] });
    },
  });
};

export const useVerifyUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.verifyUser,
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      if (data.data) {
        queryClient.setQueryData(['users', userId], data.data);
      }
    },
  });
};

export const useUnverifyUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.unverifyUser,
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      if (data.data) {
        queryClient.setQueryData(['users', userId], data.data);
      }
    },
  });
};

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'customer' | 'admin' | 'event-manager' }) => 
      userApi.changeUserRole(id, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      if (data.data) {
        queryClient.setQueryData(['users', variables.id], data.data);
      }
    },
  });
};
