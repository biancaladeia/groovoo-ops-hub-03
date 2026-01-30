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
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ticket, TicketStatus, ServiceDeskView, B2C_CATEGORIES, B2B_CATEGORIES } from '@/types';
import TicketListView from '@/components/service-desk/TicketListView';
import TicketKanbanView from '@/components/service-desk/TicketKanbanView';
import { TicketDialog, TicketDialogMode } from '@/components/service-desk/TicketDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ServiceDesk = () => {
  const { isAdmin } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<ServiceDeskView>('list');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [, setRefreshKey] = useState(0);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<TicketDialogMode>('create');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetchTickets();
    
    // Update time open every minute
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || ticket.ticket_type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    if (!isAdmin) {
      toast.error('Only admins can change ticket status');
      return;
    }

    try {
      const updateData: Partial<Ticket> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'Resolved' || newStatus === 'Closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, ...updateData } : ticket
        )
      );
      toast.success('Ticket status updated');
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const openCreateDialog = () => {
    setSelectedTicket(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openViewDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const openEditDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  // Stats
  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const highPriorityCount = tickets.filter((t) => t.priority === 'High' && t.status !== 'Closed' && t.status !== 'Resolved').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Service Desk</h2>
          <p className="text-sm text-muted-foreground">Manage support tickets and requests</p>
        </div>
        {isAdmin && (
          <Button 
            className="bg-groovoo-gradient hover:opacity-90 glow-primary text-white"
            onClick={openCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Card className="clean-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{highPriorityCount}</p>
              <p className="text-xs md:text-sm text-muted-foreground">High Priority</p>
            </div>
          </CardContent>
        </Card>
        <Card className="clean-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-warning" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{openCount}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card className="clean-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-info" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{inProgressCount}</p>
              <p className="text-xs md:text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card className="clean-card">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            {/* Search and View Toggle Row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <Tabs value={view} onValueChange={(v) => setView(v as ServiceDeskView)} className="hidden sm:block">
                <TabsList className="bg-muted">
                  <TabsTrigger value="list" className="gap-2">
                    <List className="w-4 h-4" />
                    <span className="hidden md:inline">List</span>
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden md:inline">Kanban</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-28 bg-background text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="B2C">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      B2C
                    </div>
                  </SelectItem>
                  <SelectItem value="B2B">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      B2B
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-28 bg-background text-sm">
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
                <SelectTrigger className="w-full sm:w-28 bg-background text-sm">
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

            {/* Mobile View Toggle */}
            <Tabs value={view} onValueChange={(v) => setView(v as ServiceDeskView)} className="sm:hidden">
              <TabsList className="bg-muted w-full">
                <TabsTrigger value="list" className="gap-2 flex-1">
                  <List className="w-4 h-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="kanban" className="gap-2 flex-1">
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
            <TicketListView 
              tickets={filteredTickets} 
              onStatusChange={handleStatusChange}
              onViewTicket={openViewDialog}
              onEditTicket={openEditDialog}
            />
          </motion.div>
        ) : (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TicketKanbanView 
              tickets={filteredTickets} 
              onStatusChange={handleStatusChange}
              onViewTicket={openViewDialog}
              onEditTicket={openEditDialog}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {tickets.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tickets found. {isAdmin && 'Create your first ticket to get started.'}</p>
        </div>
      )}

      {/* Ticket Dialog */}
      <TicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        ticket={selectedTicket}
        onSuccess={fetchTickets}
      />
    </div>
  );
};

export default ServiceDesk;
