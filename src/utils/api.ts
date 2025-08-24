import { User, Lead, PaginatedResponse, CreateLeadData, UpdateLeadData, LeadFilters } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(response.status, errorData.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error - please check your connection');
  }
}

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => apiRequest<{ message: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: { email: string; password: string }) =>
    apiRequest<{ message: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
  }),

  getCurrentUser: () => apiRequest<{ user: User }>('/auth/me'),
};

// Leads API
export const leadsApi = {
  getLeads: (params: {
    page?: number;
    limit?: number;
  } & LeadFilters) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return apiRequest<PaginatedResponse<Lead>>(`/leads?${searchParams}`);
  },

  getLead: (id: string) => apiRequest<Lead>(`/leads/${id}`),

  createLead: (data: CreateLeadData) =>
    apiRequest<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLead: (id: string, data: UpdateLeadData) =>
    apiRequest<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLead: (id: string) =>
    apiRequest<{ message: string }>(`/leads/${id}`, {
      method: 'DELETE',
    }),
};

export { ApiError };