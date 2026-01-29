// Event Types
export type EventStatus = 'Available' | 'Expired' | 'Unavailable' | 'Finished';
export type Gateway = 'Groovoo Square' | 'Groovoo Stripe' | 'Split Stripe' | 'Organizer Square' | 'Organizer Stripe';

export interface Event {
  id: string;
  eventName: string;
  status: EventStatus;
  gateway: Gateway;
  eventDate: Date;
  payoutDate: Date;
  grossSale: number;
  serviceFee: number;
  gatewayFee: number;
  netSale: number;
  totalPayout: number;
  payoutExecuted: boolean;
  feesReceived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket Types
export type TicketPriority = 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';

export type UserCategory = 
  | 'Account creation error'
  | 'Login/App access'
  | 'Missing confirmation email'
  | 'Ticket not in app'
  | 'Checkout error'
  | 'Duplicate charge'
  | 'Refund request'
  | 'Info/Event details';

export type OrganizerCategory =
  | 'Producer account error'
  | 'Balance/Payout inquiry'
  | 'Event/Coupon creation'
  | 'Sales reports'
  | 'Check-in/Organizer App issues'
  | 'Gateway change';

export type TicketCategory = UserCategory | OrganizerCategory;
export type TicketType = 'User' | 'Organizer';
export type Platform = 'iOS' | 'Android' | 'Web';

export interface Ticket {
  id: string;
  ticketId: string;
  subject: string;
  description: string;
  type: TicketType;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  platform?: Platform;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  moveToBacklog: boolean;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
}

// Knowledge Base Types
export interface WikiArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export type UserRole = 'Operations Manager' | 'CEO';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

// View Types
export type ServiceDeskView = 'list' | 'kanban';
