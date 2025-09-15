import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Ticket, CreateTicketData, ApiResponse, PaginatedResponse } from '@/lib/schemas';

// Ticket API functions
const ticketApi = {
  getTickets: async (params?: {
    page?: number;
    limit?: number;
    eventId?: string;
    userId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Ticket>> => {
    const response = await apiClient.get('/tickets', { params });
    return response.data;
  },

  getTicketById: async (id: string): Promise<ApiResponse<Ticket>> => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  getMyTickets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ticket>> => {
    const response = await apiClient.get('/tickets/my-tickets', { params });
    return response.data;
  },

  createTicket: async (data: CreateTicketData): Promise<ApiResponse<Ticket>> => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  cancelTicket: async (id: string): Promise<ApiResponse<Ticket>> => {
    const response = await apiClient.patch(`/tickets/${id}/cancel`);
    return response.data;
  },

  confirmTicket: async (id: string): Promise<ApiResponse<Ticket>> => {
    const response = await apiClient.patch(`/tickets/${id}/confirm`);
    return response.data;
  },

  getTicketsByEvent: async (eventId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ticket>> => {
    const response = await apiClient.get(`/events/${eventId}/tickets`, { params });
    return response.data;
  },
};

// Ticket hooks
export const useTickets = (params?: {
  page?: number;
  limit?: number;
  eventId?: string;
  userId?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => ticketApi.getTickets(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketApi.getTicketById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMyTickets = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['tickets', 'my-tickets', params],
    queryFn: () => ticketApi.getMyTickets(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTicketsByEvent = (eventId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['tickets', 'event', eventId, params],
    queryFn: () => ticketApi.getTicketsByEvent(eventId, params),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ticketApi.createTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'my-tickets'] });
      if (data.data?.eventId) {
        queryClient.invalidateQueries({ queryKey: ['tickets', 'event', data.data.eventId] });
        queryClient.invalidateQueries({ queryKey: ['events', data.data.eventId] });
      }
    },
  });
};

export const useCancelTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ticketApi.cancelTicket,
    onSuccess: (data, ticketId) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
      if (data.data?.eventId) {
        queryClient.invalidateQueries({ queryKey: ['tickets', 'event', data.data.eventId] });
        queryClient.invalidateQueries({ queryKey: ['events', data.data.eventId] });
      }
    },
  });
};

export const useConfirmTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ticketApi.confirmTicket,
    onSuccess: (data, ticketId) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
      if (data.data?.eventId) {
        queryClient.invalidateQueries({ queryKey: ['tickets', 'event', data.data.eventId] });
        queryClient.invalidateQueries({ queryKey: ['events', data.data.eventId] });
      }
    },
  });
};
