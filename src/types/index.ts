export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Lead {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
  state?: string;
  source: 'website' | 'facebook_ads' | 'google_ads' | 'referral' | 'events' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
  score: number;
  lead_value: number;
  last_activity_at?: string;
  is_qualified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadFilters {
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  source?: string;
  status?: string;
  score_gt?: number;
  score_lt?: number;
  is_qualified?: boolean;
}

export interface CreateLeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
  state?: string;
  source: string;
  status?: string;
  score?: number;
  leadValue?: number;
  isQualified?: boolean;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {}