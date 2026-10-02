/**
 * SUTRA STUDIO / SHRI RAM TECH
 * Client Information, Knowledge Base & AI Chatbot Data Contracts
 */

export type SubmissionStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'CLIENT_UPDATED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED';

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  about: string;
  industry: string;
  foundedYear: string;
  companySize: string;
  websiteUrl: string;
  logoUrl?: string;
  images?: string[];
}

export interface ServiceItem {
  id: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  features: string[];
  startingPrice: string;
  ctaText: string;
  imageUrl?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  productUrl?: string;
  imageUrl?: string;
}

export interface PricingPlanItem {
  id: string;
  name: string;
  category: string;
  price: string;
  billingPeriod: 'monthly' | 'yearly' | 'one-time';
  description: string;
  features: string[];
  userLimit?: string;
  storage?: string;
  support?: string;
  integrations?: string;
  ctaText: string;
  isPopular?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  businessHours: string;
  googleMapsUrl?: string;
  contactPageUrl?: string;
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
}

export interface PoliciesInfo {
  termsAndConditions?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  shippingPolicy?: string;
  cancellationPolicy?: string;
  customInformation?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'txt' | 'image';
  size: string;
  url: string;
  uploadedAt: string;
  extractedText?: string;
  chunksCount?: number;
  status: 'uploaded' | 'processed' | 'approved' | 'rejected';
}

export interface ClientSubmission {
  id: string;
  client_id: string;
  client_name?: string;
  status: SubmissionStatus;
  version: number;
  company: CompanyInfo;
  services: ServiceItem[];
  products: ProductItem[];
  pricing_plans: PricingPlanItem[];
  faqs: FAQItem[];
  contact: ContactInfo;
  policies: PoliciesInfo;
  documents: DocumentItem[];
  changes_requested_message?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeRecord {
  id: string;
  client_id: string;
  category:
    | 'Company'
    | 'About'
    | 'Services'
    | 'Products'
    | 'Pricing'
    | 'Features'
    | 'FAQs'
    | 'Contact'
    | 'Policies'
    | 'Documents'
    | 'Custom Knowledge';
  title: string;
  content: string;
  source: string;
  status: 'draft' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  published: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface LeadRecord {
  id: string;
  client_id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  requirement?: string;
  message?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Closed';
  source: 'chatbot' | 'human_handoff' | 'contact_form';
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  record: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}
