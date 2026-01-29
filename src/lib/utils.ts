import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate payout date (3 workdays after event date)
export function calculatePayoutDate(eventDate: Date): Date {
  const result = new Date(eventDate);
  let workdaysAdded = 0;
  
  while (workdaysAdded < 3) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workdaysAdded++;
    }
  }
  
  return result;
}

// Calculate net sale
export function calculateNetSale(grossSale: number, serviceFee: number, gatewayFee: number): number {
  return grossSale - serviceFee - gatewayFee;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

// Format date with time
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Calculate time open for tickets
export function calculateTimeOpen(createdAt: Date): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  } else {
    return `${diffMins}m`;
  }
}

// Generate ticket ID
export function generateTicketId(): string {
  const prefix = 'TKT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Generate markdown for backlog
export function generateBacklogMarkdown(ticket: {
  ticketId: string;
  category: string;
  platform?: string;
  description: string;
}): string {
  return `# ${ticket.ticketId} - ${ticket.category}

| Platform: ${ticket.platform || 'N/A'} |

## Description
${ticket.description}

## Acceptance Criteria
- [ ] Issue is reproducible on ${ticket.platform || 'all platforms'}
- [ ] Root cause identified
- [ ] Fix implemented and tested
- [ ] No regression in related features
- [ ] Documentation updated if needed

## Notes
_Add additional context here_
`;
}
