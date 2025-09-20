import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/schemas';

type DashboardStats = {
  pendingVerifications: number;
  activeUsers: number;
  eventsToday: number;
  pendingEvents: number;
  todayOrders: number;
  totalRevenue: number;
};

// Analytics API functions
const analyticsApi = {
  getDashboardStats: async (): Promise<ApiResponse<{
    stats: DashboardStats;
  }>> => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  getUserStats: async (params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    userGrowth: Array<{ date: string; count: number }>;
  }>> => {
    const response = await apiClient.get('/analytics/users', { params });
    return response.data;
  },

  getEventStats: async (params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{
    totalEvents: number;
    publishedEvents: number;
    cancelledEvents: number;
    eventsByCategory: Record<string, number>;
    eventsByMonth: Array<{ month: string; count: number }>;
  }>> => {
    const response = await apiClient.get('/analytics/events', { params });
    return response.data;
  },

  getTicketStats: async (params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{
    totalTickets: number;
    confirmedTickets: number;
    cancelledTickets: number;
    ticketsByStatus: Record<string, number>;
    ticketSales: Array<{ date: string; count: number; revenue: number }>;
  }>> => {
    const response = await apiClient.get('/analytics/tickets', { params });
    return response.data;
  },

  getRevenueStats: async (params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    revenueByMonth: Array<{ month: string; revenue: number }>;
    topEvents: Array<{ eventId: string; title: string; revenue: number }>;
  }>> => {
    const response = await apiClient.get('/analytics/revenue', { params });
    return response.data;
  },
};

// Analytics hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboardStats,
    select: (data) => data.data.stats, // Extract the stats object from the response
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export type { DashboardStats };

export const useUserStats = (params?: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['analytics', 'users', params],
    queryFn: () => analyticsApi.getUserStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEventStats = (params?: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['analytics', 'events', params],
    queryFn: () => analyticsApi.getEventStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTicketStats = (params?: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['analytics', 'tickets', params],
    queryFn: () => analyticsApi.getTicketStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRevenueStats = (params?: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['analytics', 'revenue', params],
    queryFn: () => analyticsApi.getRevenueStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
