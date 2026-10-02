export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_period: 'monthly' | 'yearly';
  features: string[];
  allowances?: Record<string, number>;
  is_active: boolean;
  is_popular?: boolean;
  order?: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Usage {
  id: string;
  client_id: string;
  service_key: string;
  period_start: string;
  period_end: string;
  used: number;
  limit: number;
  created_at: string;
  updated_at: string;
}
