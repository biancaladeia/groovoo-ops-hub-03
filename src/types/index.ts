// Event Types
export type EventStatus = 'Available' | 'Expired' | 'Unavailable' | 'Finished';
export type Gateway = 'Groovoo Square' | 'Groovoo Stripe' | 'Split Stripe' | 'Organizer Square' | 'Organizer Stripe';

export interface Event {
  id: string;
  event_name: string;
  status: EventStatus;
  gateway: Gateway;
  event_date: string;
  payout_date: string;
  gross_sale: number;
  service_fee: number;
  gateway_fee: number;
  processing_fee: number;
  net_sale: number;
  total_payout: number;
  payout_executed: boolean;
  fees_received: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Ticket Types
export type TicketPriority = 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
export type TicketType = 'B2C' | 'B2B';
export type Platform = 'iOS' | 'Android' | 'Web';

// B2C Categories
export const B2C_CATEGORIES = [
  'Account creation error',
  'Login/App access',
  'Missing confirmation email',
  'Ticket not in app',
  'Checkout error',
  'Duplicate charge',
  'Refund request',
] as const;

// B2B Categories
export const B2B_CATEGORIES = [
  'Producer account error',
  'Balance/Payout inquiry',
  'Event/Coupon creation',
  'Sales reports',
  'Check-in/Organizer App issues',
  'Gateway change',
] as const;

export type B2CCategory = typeof B2C_CATEGORIES[number];
export type B2BCategory = typeof B2B_CATEGORIES[number];
export type TicketCategory = B2CCategory | B2BCategory | string;

export interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string | null;
  ticket_type: TicketType;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  platform: Platform | null;
  assignee_id: string | null;
  move_to_backlog: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_by: string | null;
  uploaded_at: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
}

// Knowledge Base Types
export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// User Types
export type AppRole = 'admin' | 'staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// View Types
export type ServiceDeskView = 'list' | 'kanban';
