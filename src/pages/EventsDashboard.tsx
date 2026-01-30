import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Event, EventStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EventDialog, EventDialogMode } from '@/components/events/EventDialog';

const statusConfig: Record<EventStatus, { color: string; icon: typeof CheckCircle2 }> = {
  Available: { color: 'status-available', icon: CheckCircle2 },
  Expired: { color: 'status-expired', icon: XCircle },
  Unavailable: { color: 'status-unavailable', icon: AlertTriangle },
  Finished: { color: 'status-finished', icon: Clock },
};

const EventsDashboard = () => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<EventDialogMode>('create');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesGateway = gatewayFilter === 'all' || event.gateway === gatewayFilter;
    return matchesSearch && matchesStatus && matchesGateway;
  });

  const handlePayoutToggle = async (eventId: string, checked: boolean) => {
    if (!isAdmin) {
      toast.error('Only admins can change payout status');
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .update({ payout_executed: checked })
        .eq('id', eventId);

      if (error) throw error;

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, payout_executed: checked } : event
        )
      );
      toast.success('Payout status updated');
    } catch (error) {
      console.error('Error updating payout:', error);
      toast.error('Failed to update payout status');
    }
  };

  const handleFeesToggle = async (eventId: string, checked: boolean) => {
    if (!isAdmin) {
      toast.error('Only admins can change fees status');
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .update({ fees_received: checked })
        .eq('id', eventId);

      if (error) throw error;

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, fees_received: checked } : event
        )
      );
      toast.success('Fees status updated');
    } catch (error) {
      console.error('Error updating fees:', error);
      toast.error('Failed to update fees status');
    }
  };

  const openCreateDialog = () => {
    setSelectedEvent(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const openViewDialog = (event: Event) => {
    setSelectedEvent(event);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const confirmDelete = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

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
          <h2 className="text-xl md:text-2xl font-bold">Events Management</h2>
          <p className="text-sm text-muted-foreground">Manage event lifecycles and payouts</p>
        </div>
        {isAdmin && (
          <Button 
            className="bg-groovoo-gradient hover:opacity-90 glow-primary text-white"
            onClick={openCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="clean-card">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36 bg-background text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                  <SelectItem value="Finished">Finished</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-background text-sm">
                  <SelectValue placeholder="Gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  <SelectItem value="Groovoo Square">Groovoo Square</SelectItem>
                  <SelectItem value="Groovoo Stripe">Groovoo Stripe</SelectItem>
                  <SelectItem value="Split Stripe">Split Stripe</SelectItem>
                  <SelectItem value="Organizer Square">Organizer Square</SelectItem>
                  <SelectItem value="Organizer Stripe">Organizer Stripe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table/Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="clean-card overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">
              Events ({filteredEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            {/* Mobile View */}
            <div className="md:hidden space-y-3 p-4">
              {filteredEvents.map((event) => {
                const StatusIcon = statusConfig[event.status].icon;
                return (
                  <div key={event.id} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.event_name}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={`${statusConfig[event.status].color} flex items-center gap-1`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {event.status}
                          </Badge>
                          <Badge variant="secondary" className="bg-muted text-xs">
                            {event.gateway}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(event)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuItem onClick={() => openEditDialog(event)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Event
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => confirmDelete(event)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Event
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground text-xs">Event Date</p>
                        <p>{formatDate(new Date(event.event_date))}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Payout Date</p>
                        <p>{formatDate(new Date(event.payout_date))}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Gross Sale</p>
                        <p className="font-medium">{formatCurrency(Number(event.gross_sale))}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Total Payout</p>
                        <p className="font-bold text-primary">{formatCurrency(Number(event.total_payout))}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-3 border-t border-border">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={event.payout_executed}
                          onCheckedChange={(checked) =>
                            handlePayoutToggle(event.id, checked as boolean)
                          }
                          disabled={!isAdmin}
                          className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                        />
                        Payout
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={event.fees_received}
                          onCheckedChange={(checked) =>
                            handleFeesToggle(event.id, checked as boolean)
                          }
                          disabled={!isAdmin}
                          className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                        />
                        Fees
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Event Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Payout Date</TableHead>
                    <TableHead className="text-right">Gross Sale</TableHead>
                    <TableHead className="text-right">Service Fee</TableHead>
                    <TableHead className="text-right">Gateway Fee</TableHead>
                    <TableHead className="text-right">Net Sale</TableHead>
                    <TableHead className="text-right">Total Payout</TableHead>
                    <TableHead className="text-center">Payout</TableHead>
                    <TableHead className="text-center">Fees</TableHead>
                    {isAdmin && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => {
                    const StatusIcon = statusConfig[event.status].icon;
                    return (
                      <TableRow key={event.id} className="border-border">
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {event.event_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${statusConfig[event.status].color} flex items-center gap-1 w-fit`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-muted">
                            {event.gateway}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(new Date(event.event_date))}</TableCell>
                        <TableCell>{formatDate(new Date(event.payout_date))}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(event.gross_sale))}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(Number(event.service_fee))}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(Number(event.gateway_fee))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(event.net_sale))}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatCurrency(Number(event.total_payout))}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={event.payout_executed}
                            onCheckedChange={(checked) =>
                              handlePayoutToggle(event.id, checked as boolean)
                            }
                            disabled={!isAdmin}
                            className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={event.fees_received}
                            onCheckedChange={(checked) =>
                              handleFeesToggle(event.id, checked as boolean)
                            }
                            disabled={!isAdmin}
                            className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                          />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openViewDialog(event)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuItem onClick={() => openEditDialog(event)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit Event
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => confirmDelete(event)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Event
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {events.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No events found. {isAdmin && 'Create your first event to get started.'}</p>
        </div>
      )}

      {/* Event Dialog */}
      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        event={selectedEvent}
        onSuccess={fetchEvents}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.event_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventsDashboard;
