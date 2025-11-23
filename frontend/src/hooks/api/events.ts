import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Event, CreateEventData, UpdateEventData, ApiResponse, PaginatedResponse } from '@/lib/schemas';

// Base endpoint for events
const EVENTS_ENDPOINT = '/event/list';

// Event API functions
export const eventApi = {
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    organizer?: string;
    date?: string;
    sort?: string;
    tags?: string | string[];
    featured?: boolean;
    verified?: boolean;
  }): Promise<PaginatedResponse<Event>> => {
    const response = await apiClient.get(EVENTS_ENDPOINT, {
      params: {
        ...params,
        page: params?.page || 1,
        limit: params?.limit || 10,
        sortBy: params?.sort?.startsWith('-') ? params.sort.substring(1) : params?.sort,
        order: params?.sort?.startsWith('-') ? 'desc' : 'asc'
      }
    });

    // Transform the response to match the expected PaginatedResponse format
    const { data } = response;
    const { events, pagination } = data.data;

    return {
      success: data.success,
      message: data.message,
      data: {
        items: events || [],
        totalItems: pagination?.total || 0,
        totalPages: pagination?.totalPages || 1,
        currentPage: pagination?.page || 1,
        hasNextPage: pagination?.page < (pagination?.totalPages || 1),
        hasPrevPage: (pagination?.page || 1) > 1
      }
    };
  },

  getEventById: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await apiClient.get(`/event/list/${id}`);
    // The API returns the event data directly in the response
    return response.data;
  },

  createEvent: async (data: CreateEventData): Promise<ApiResponse<Event>> => {
    const response = await apiClient.post('/event/create', data);
    return response.data;
  },

  updateEvent: async (id: string, data: UpdateEventData): Promise<ApiResponse<Event>> => {
    const response = await apiClient.put(`/event/update/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/event/delete/${id}`);
    return response.data;
  },

  publishEvent: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await apiClient.patch(`/event/verify/${id}`);
    return response.data;
  },

  cancelEvent: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await apiClient.patch(`${EVENTS_ENDPOINT}/${id}/cancel`);
    return response.data;
  },

  rejectEvent: async (id: string, reason?: string): Promise<ApiResponse<Event>> => {
    const response = await apiClient.patch(`/event/reject/${id}`, { reason });
    return response.data;
  },

  getMyEvents: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Event>> => {
    const response = await apiClient.get('/event/owner', { params });
    return response.data;
  },

  uploadEventImage: async (id: string, file: File): Promise<ApiResponse<{ imageUrl: string }>> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post(`/event/update/${id}`, formData, {
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
  sort?: string;
  verified?: boolean;
}) => {
  return useQuery<PaginatedResponse<Event>, Error>({
    queryKey: ['events', params],
    queryFn: async () => {
      // Extract verified from params and pass it to getEvents
      const { verified, ...restParams } = params || {};
      const response = await eventApi.getEvents({
        ...restParams,
        verified: verified
      });
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useEvent = (id: string) => {
  return useQuery<ApiResponse<Event>, Error>({
    queryKey: ['events', id],
    queryFn: () => eventApi.getEventById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
};

export const useMyEvents = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  return useQuery<PaginatedResponse<Event>, Error>({
    queryKey: ['events', 'my-events', params],
    queryFn: () => eventApi.getMyEvents(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Event>, Error, CreateEventData>({
    mutationFn: eventApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Event>, Error, { id: string; data: UpdateEventData }>({
    mutationFn: ({ id, data }) => eventApi.updateEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: (id) => eventApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
    },
  });
};

export const usePublishEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Event>, Error, string>({
    mutationFn: (id) => eventApi.publishEvent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
    },
  });
};

export const useCancelEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Event>, Error, string>({
    mutationFn: (id) => eventApi.cancelEvent(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
      if (data.data) {
        queryClient.setQueryData(['events', id], data.data);
      }
    },
  });
};

export const useRejectEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Event>, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => eventApi.rejectEvent(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });
    },
  });
};

export const useUploadEventImage = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ imageUrl: string }>, Error, { id: string; file: File }>({
    mutationFn: ({ id, file }) => eventApi.uploadEventImage(id, file),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({ queryKey: ['events', 'my-events'] });

      if (data.data) {
        // Update the event data with the new image URL
        queryClient.setQueryData<ApiResponse<Event>>(['events', id], (oldData) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              imageUrl: data.data.imageUrl,
            },
          };
        });
      }
    },
  });
};
