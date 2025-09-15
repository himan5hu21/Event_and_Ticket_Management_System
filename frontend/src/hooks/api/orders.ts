import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Order, ApiResponse, PaginatedResponse } from '@/lib/schemas';

// Order API functions
const orderApi = {
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  getMyOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get('/orders/my-orders', { params });
    return response.data;
  },

  createOrder: async (data: { ticketIds: string[] }): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: 'pending' | 'completed' | 'failed' | 'refunded'): Promise<ApiResponse<Order>> => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  processPayment: async (id: string, paymentData: any): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post(`/orders/${id}/payment`, paymentData);
    return response.data;
  },

  refundOrder: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post(`/orders/${id}/refund`);
    return response.data;
  },
};

// Order hooks
export const useOrders = (params?: {
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.getOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMyOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['orders', 'my-orders', params],
    queryFn: () => orderApi.getMyOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'completed' | 'failed' | 'refunded' }) => 
      orderApi.updateOrderStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      if (data.data) {
        queryClient.setQueryData(['orders', variables.id], data.data);
      }
    },
  });
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, paymentData }: { id: string; paymentData: any }) => 
      orderApi.processPayment(id, paymentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      if (data.data) {
        queryClient.setQueryData(['orders', variables.id], data.data);
      }
    },
  });
};

export const useRefundOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: orderApi.refundOrder,
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      if (data.data) {
        queryClient.setQueryData(['orders', orderId], data.data);
      }
    },
  });
};
