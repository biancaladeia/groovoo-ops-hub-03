import { motion } from 'framer-motion';
import {
  Clock,
  User,
  Building2,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ticket, TicketStatus, TicketPriority } from '@/types';
import { calculateTimeOpen, formatDateTime } from '@/lib/utils';

interface TicketListViewProps {
  tickets: Ticket[];
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
}

const priorityConfig: Record<TicketPriority, string> = {
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

const statusConfig: Record<TicketStatus, { color: string; bgColor: string }> = {
  Open: { color: 'text-warning', bgColor: 'bg-warning/20' },
  'In Progress': { color: 'text-info', bgColor: 'bg-info/20' },
  Waiting: { color: 'text-muted-foreground', bgColor: 'bg-muted' },
  Resolved: { color: 'text-success', bgColor: 'bg-success/20' },
  Closed: { color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

const TicketListView = ({ tickets, onStatusChange }: TicketListViewProps) => {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Tickets ({tickets.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Time Open
                  </div>
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket, index) => {
                const timeOpen = calculateTimeOpen(ticket.createdAt);
                const isOverdue = ticket.status !== 'Resolved' && 
                  ticket.status !== 'Closed' && 
                  Date.now() - new Date(ticket.createdAt).getTime() > 24 * 60 * 60 * 1000;

                return (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-border hover:bg-muted/30"
                  >
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {ticket.ticketId}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <p className="font-medium truncate">{ticket.subject}</p>
                      {ticket.platform && (
                        <span className="text-xs text-muted-foreground">
                          {ticket.platform}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          ticket.type === 'User'
                            ? 'border-info/50 text-info'
                            : 'border-primary/50 text-primary'
                        }
                      >
                        {ticket.type === 'User' ? (
                          <User className="w-3 h-3 mr-1" />
                        ) : (
                          <Building2 className="w-3 h-3 mr-1" />
                        )}
                        {ticket.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{ticket.category}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityConfig[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${statusConfig[ticket.status].bgColor} ${statusConfig[ticket.status].color}`}
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.assignee ? (
                        <span className="text-sm">{ticket.assignee}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-mono ${
                          isOverdue ? 'text-destructive font-bold' : ''
                        }`}
                      >
                        {timeOpen}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'Open')}>
                            Set to Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'In Progress')}>
                            Set to In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'Waiting')}>
                            Set to Waiting
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'Resolved')}>
                            Set to Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'Closed')}>
                            Set to Closed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketListView;
