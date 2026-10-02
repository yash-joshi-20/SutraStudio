// Client Information Management Types for Shri Ram Tech System

export type SubmissionStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'CLIENT_UPDATED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED';

export type KnowledgeStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected' | 'unpublished';

export interface CompanyInfo {
  id?: string;
  client_id?: string;
  company_name: string;
  company_tagline?: string;
  company_description?: string;
  about_company?: string;
  industry?: string;
  founded_year?: number;
  company_size?: string;
  website_url?: string;
  logo_url?: string;
  company_images?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id?: string;
  client_id?: string;
  service_name: string;
  short_description?: string;
  detailed_description?: string;
  features?: string[];
  starting_price?: number;
  cta?: string;
  service_image?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id?: string;
  client_id?: string;
  product_name: string;
  description?: string;
  features?: string[];
  price?: number;
  product_url?: string;
  product_image?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PricingPlan {
  id?: string;
  client_id?: string;
  plan_name: string;
  category?: string;
  price?: number;
  billing_period?: string;
  description?: string;
  features?: string[];
  user_limit?: string;
  storage?: string;
  support?: string;
  integrations?: string[];
  cta?: string;
  popular_badge?: boolean;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FAQ {
  id?: string;
  client_id?: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContactInfo {
  id?: string;
  client_id?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  business_hours?: string;
  google_maps_url?: string;
  contact_page_url?: string;
  social_media_urls?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface Policies {
  id?: string;
  client_id?: string;
  terms_conditions?: string;
  privacy_policy?: string;
  refund_policy?: string;
  shipping_policy?: string;
  cancellation_policy?: string;
  custom_information?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id?: string;
  client_id?: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  extracted_text?: string;
  processed?: boolean;
  approved?: boolean;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubmissionReview {
  id?: string;
  submission_id: string;
  admin_id: string;
  action: 'approve' | 'reject' | 'request_changes' | 'edit' | 'publish' | 'unpublish';
  message?: string;
  created_at?: string;
}

export interface InformationSubmission {
  id?: string;
  client_id: string;
  status: SubmissionStatus;
  changes_requested_message?: string;
  company?: CompanyInfo;
  services?: Service[];
  products?: Product[];
  pricing_plans?: PricingPlan[];
  faqs?: FAQ[];
  contact?: ContactInfo;
  policies?: Policies;
  documents?: Document[];
  reviewed_by?: string;
  reviewed_at?: string;
  approved_at?: string;
  published_at?: string;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeBaseRecord {
  id?: string;
  client_id: string;
  category: 'Company' | 'About' | 'Services' | 'Products' | 'Pricing' | 'Features' | 'FAQs' | 'Contact' | 'Policies' | 'Documents' | 'Custom Knowledge';
  title: string;
  content: string;
  source?: string;
  status: KnowledgeStatus;
  approved: boolean;
  published: boolean;
  approved_by?: string;
  approved_at?: string;
  published_at?: string;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeChunk {
  id?: string;
  knowledge_id: string;
  client_id: string;
  content: string;
  embedding?: number[];
  chunk_index: number;
  approved: boolean;
  published: boolean;
  created_at?: string;
}

export interface KnowledgeVersion {
  id?: string;
  client_id: string;
  knowledge_id?: string;
  version_number: number;
  changed_by: string;
  previous_content?: string;
  new_content?: string;
  approval_status: string;
  created_at?: string;
}

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  requirement?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Closed';
  source: 'chatbot' | 'contact' | 'handoff' | 'other';
  client_id?: string;
  session_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id?: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  client_id?: string;
  created_at?: string;
}

export interface ChatSession {
  id?: string;
  client_id: string;
  visitor_id?: string;
  title?: string;
  messages?: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id?: string;
  user: string;
  action: string;
  record_type?: string;
  record_id?: string;
  old_value?: any;
  new_value?: any;
  client_id?: string;
  timestamp?: string;
}