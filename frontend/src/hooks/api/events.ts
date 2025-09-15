import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Event, CreateEventData, UpdateEventData, ApiResponse, PaginatedResponse } from '@/lib/schemas';

// Event API functions
const eventApi = {
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    organizer?: string;
    date?: string;
  }): Promise<PaginatedResponse<Event>> => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  getEventById: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: CreateEventData): Promise<ApiResponse<Event>> => {
    const response = await apiClient.post('/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: UpdateEventData): Promise<ApiResponse<Event>> => {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },

  publishEvent: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await apiClient.patch(`/events/${id}/publish`);
    return response.data;
  },

  cancelEvent: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await apiClient.patch(`/events/${id}/cancel`);
    return response.data;
  },

  getMyEvents: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Event>> => {
    const response = await apiClient.get('/events/my-events', { params });
    return response.data;
  },

  uploadEventImage: async (id: string, file: File): Promise<ApiResponse<{ imageUrl: string }>> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/events/${id}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Event hooks
export const useEvents = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  organizer?: string;
  date?: string;
}) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventApi.getEvents(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventApi.getEventById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMyEvents = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['events', 'my-events', params],
    queryFn: () => eventApi.getMyEvents(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventData }) => 
      eventApi.updateEvent(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
      if (data.data) {
        queryClient.setQueryData(['events', variables.id], data.data);
      }
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventApi.deleteEvent,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
      queryClient.removeQueries({ queryKey: ['events', eventId] });
    },
  });
};

export const usePublishEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventApi.publishEvent,
    onSuccess: (data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      if (data.data) {
        queryClient.setQueryData(['events', eventId], data.data);
      }
    },
  });
};

export const useCancelEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventApi.cancelEvent,
    onSuccess: (data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      if (data.data) {
        queryClient.setQueryData(['events', eventId], data.data);
      }
    },
  });
};

export const useUploadEventImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => 
      eventApi.uploadEventImage(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
    },
  });
};
