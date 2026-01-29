import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  List,
  LayoutGrid,
  Clock,
  User,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { calculateTimeOpen, formatDateTime } from '@/lib/utils';
import { Ticket, TicketStatus, TicketPriority, ServiceDeskView } from '@/types';
import TicketListView from '@/components/service-desk/TicketListView';
import TicketKanbanView from '@/components/service-desk/TicketKanbanView';

// Mock data
const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketId: 'TKT-M7X2Y-A1B2',
    subject: 'Unable to log in after password reset',
    description: 'User reports they cannot access their account after resetting password. Error message shows "Invalid credentials".',
    type: 'User',
    category: 'Login/App access',
    priority: 'High',
    status: 'Open',
    platform: 'iOS',
    assignee: 'John D.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(),
    moveToBacklog: false,
    attachments: [],
  },
  {
    id: '2',
    ticketId: 'TKT-N8Y3Z-B2C3',
    subject: 'Duplicate charge on credit card',
    description: 'Customer was charged twice for the same ticket purchase. Order #12345.',
    type: 'User',
    category: 'Duplicate charge',
    priority: 'High',
    status: 'In Progress',
    platform: 'Web',
    assignee: 'Sarah M.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(),
    moveToBacklog: false,
    attachments: [],
  },
  {
    id: '3',
    ticketId: 'TKT-P9Z4A-C3D4',
    subject: 'Payout not received for last event',
    description: 'Organizer claims payout for "Summer Fest" event not received. Event was on Jan 15.',
    type: 'Organizer',
    category: 'Balance/Payout inquiry',
    priority: 'Medium',
    status: 'Waiting',
    assignee: 'Mike R.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    moveToBacklog: false,
    attachments: [],
  },
  {
    id: '4',
    ticketId: 'TKT-Q1A5B-D4E5',
    subject: 'Ticket not showing in app',
    description: 'Customer purchased ticket but cannot see it in the Groovoo app. Purchase confirmed via email.',
    type: 'User',
    category: 'Ticket not in app',
    priority: 'Medium',
    status: 'Open',
    platform: 'Android',
    assignee: undefined,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(),
    moveToBacklog: false,
    attachments: [],
  },
  {
    id: '5',
    ticketId: 'TKT-R2B6C-E5F6',
    subject: 'Request to change payment gateway',
    description: 'Organizer wants to switch from Square to Stripe for their upcoming events.',
    type: 'Organizer',
    category: 'Gateway change',
    priority: 'Low',
    status: 'In Progress',
    assignee: 'Emily T.',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date(),
    moveToBacklog: false,
    attachments: [],
  },
  {
    id: '6',
    ticketId: 'TKT-S3C7D-F6G7',
    subject: 'Refund request for cancelled event',
    description: 'Event "Jazz Night" was cancelled. Customer requesting full refund.',
    type: 'User',
    category: 'Refund request',
    priority: 'High',
    status: 'Open',
    platform: 'Web',
    assignee: 'John D.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(),
    moveToBacklog: false,
    attachments: [],
  },
  {
    id: '7',
    ticketId: 'TKT-T4D8E-G7H8',
    subject: 'Check-in app not scanning QR codes',
    description: 'Organizer reports the check-in app is not recognizing valid QR codes at their venue.',
    type: 'Organizer',
    category: 'Check-in/Organizer App issues',
    priority: 'High',
    status: 'Resolved',
    platform: 'iOS',
    assignee: 'Sarah M.',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    updatedAt: new Date(),
    resolvedAt: new Date(),
    moveToBacklog: false,
    attachments: [],
  },
  {
    id: '8',
    ticketId: 'TKT-U5E9F-H8I9',
    subject: 'Need sales report for tax purposes',
    description: 'Organizer requesting detailed sales report for Q4 2024 for tax filing.',
    type: 'Organizer',
    category: 'Sales reports',
    priority: 'Low',
    status: 'Closed',
    assignee: 'Mike R.',
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
    updatedAt: new Date(),
    resolvedAt: new Date(),
    moveToBacklog: false,
    attachments: [],
  },
];

const ServiceDesk = () => {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<ServiceDeskView>('list');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [, setRefreshKey] = useState(0);

  // Update time open every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || ticket.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: newStatus,
              updatedAt: new Date(),
              resolvedAt: newStatus === 'Resolved' || newStatus === 'Closed' ? new Date() : undefined,
            }
          : ticket
      )
    );
  };

  // Stats
  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const highPriorityCount = tickets.filter((t) => t.priority === 'High' && t.status !== 'Closed' && t.status !== 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Service Desk</h2>
          <p className="text-muted-foreground">Manage support tickets and requests</p>
        </div>
        <Button className="bg-groovoo-gradient hover:opacity-90 shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{highPriorityCount}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openCount}</p>
              <p className="text-sm text-muted-foreground">Open Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/50"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-36 bg-muted/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="User">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User
                    </div>
                  </SelectItem>
                  <SelectItem value="Organizer">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Organizer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-36 bg-muted/50">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36 bg-muted/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Waiting">Waiting</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <Tabs value={view} onValueChange={(v) => setView(v as ServiceDeskView)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="kanban" className="gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Kanban
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Views */}
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <TicketListView tickets={filteredTickets} onStatusChange={handleStatusChange} />
          </motion.div>
        ) : (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TicketKanbanView tickets={filteredTickets} onStatusChange={handleStatusChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDesk;
