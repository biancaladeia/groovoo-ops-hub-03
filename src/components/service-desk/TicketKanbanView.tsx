import { motion } from 'framer-motion';
import {
  Clock,
  User,
  Building2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Ticket, TicketStatus, TicketPriority } from '@/types';
import { calculateTimeOpen } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface TicketKanbanViewProps {
  tickets: Ticket[];
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
  onViewTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
}

const columns: { status: TicketStatus; title: string; color: string }[] = [
  { status: 'Open', title: 'Open', color: 'bg-warning' },
  { status: 'In Progress', title: 'In Progress', color: 'bg-info' },
  { status: 'Waiting', title: 'Waiting', color: 'bg-muted-foreground' },
  { status: 'Resolved', title: 'Resolved', color: 'bg-success' },
  { status: 'Closed', title: 'Closed', color: 'bg-muted-foreground' },
];

const priorityConfig: Record<TicketPriority, string> = {
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

const TicketKanbanView = ({ tickets, onStatusChange, onViewTicket, onEditTicket }: TicketKanbanViewProps) => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {columns.map((column) => {
        const columnTickets = tickets.filter((t) => t.status === column.status);

        return (
          <Card key={column.status} className="glass-card flex flex-col h-[600px]">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${column.color}`} />
                  {column.title}
                </div>
                <Badge variant="secondary" className="bg-muted">
                  {columnTickets.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-2">
                <div className="space-y-3">
                    {columnTickets.map((ticket, index) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        index={index}
                        onStatusChange={onStatusChange}
                        onViewTicket={onViewTicket}
                        onEditTicket={onEditTicket}
                        isAdmin={isAdmin}
                      />
                    ))}
                  {columnTickets.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No tickets
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const TicketCard = ({
  ticket,
  index,
  onStatusChange,
  onViewTicket,
  onEditTicket,
  isAdmin,
}: {
  ticket: Ticket;
  index: number;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
  onViewTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  isAdmin: boolean;
}) => {
  const timeOpen = calculateTimeOpen(new Date(ticket.created_at));
  const isOverdue =
    ticket.status !== 'Resolved' &&
    ticket.status !== 'Closed' &&
    Date.now() - new Date(ticket.created_at).getTime() > 24 * 60 * 60 * 1000;

  const handleClick = () => {
    if (isAdmin) {
      onEditTicket(ticket);
    } else {
      onViewTicket(ticket);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer border border-border/50 hover:border-primary/30"
      onClick={handleClick}
      draggable
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <code className="text-xs bg-background/50 px-1.5 py-0.5 rounded">
          {ticket.ticket_number.split('-').slice(0, 2).join('-')}
        </code>
        <Badge variant="outline" className={`text-xs ${priorityConfig[ticket.priority]}`}>
          {ticket.priority}
        </Badge>
      </div>

      {/* Subject */}
      <p className="text-sm font-medium line-clamp-2 mb-2">{ticket.subject}</p>

      {/* Category */}
      <p className="text-xs text-muted-foreground mb-3 truncate">{ticket.category}</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {ticket.ticket_type === 'B2C' ? (
            <User className="w-3 h-3 text-info" />
          ) : (
            <Building2 className="w-3 h-3 text-primary" />
          )}
          {ticket.platform && (
            <span className="text-muted-foreground">{ticket.platform}</span>
          )}
        </div>
        <div
          className={`flex items-center gap-1 ${
            isOverdue ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {isOverdue && <AlertCircle className="w-3 h-3" />}
          <Clock className="w-3 h-3" />
          <span className="font-mono">{timeOpen}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketKanbanView;
