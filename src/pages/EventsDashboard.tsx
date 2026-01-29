import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
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
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Event, EventStatus, Gateway } from '@/types';

// Mock data
const mockEvents: Event[] = [
  {
    id: '1',
    eventName: 'Summer Music Festival 2025',
    status: 'Available',
    gateway: 'Groovoo Stripe',
    eventDate: new Date('2025-02-15'),
    payoutDate: new Date('2025-02-20'),
    grossSale: 45000,
    serviceFee: 2250,
    gatewayFee: 1350,
    netSale: 41400,
    totalPayout: 41400,
    payoutExecuted: false,
    feesReceived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    eventName: 'Jazz Night Downtown',
    status: 'Finished',
    gateway: 'Groovoo Square',
    eventDate: new Date('2025-01-20'),
    payoutDate: new Date('2025-01-23'),
    grossSale: 12500,
    serviceFee: 625,
    gatewayFee: 375,
    netSale: 11500,
    totalPayout: 11500,
    payoutExecuted: true,
    feesReceived: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    eventName: 'Tech Conference 2025',
    status: 'Available',
    gateway: 'Split Stripe',
    eventDate: new Date('2025-03-10'),
    payoutDate: new Date('2025-03-13'),
    grossSale: 89000,
    serviceFee: 4450,
    gatewayFee: 2670,
    netSale: 81880,
    totalPayout: 81880,
    payoutExecuted: false,
    feesReceived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    eventName: 'Comedy Club Night',
    status: 'Expired',
    gateway: 'Organizer Stripe',
    eventDate: new Date('2025-01-05'),
    payoutDate: new Date('2025-01-08'),
    grossSale: 5600,
    serviceFee: 280,
    gatewayFee: 168,
    netSale: 5152,
    totalPayout: 5152,
    payoutExecuted: false,
    feesReceived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    eventName: 'Beach Party Sunset',
    status: 'Unavailable',
    gateway: 'Organizer Square',
    eventDate: new Date('2025-04-20'),
    payoutDate: new Date('2025-04-23'),
    grossSale: 23400,
    serviceFee: 1170,
    gatewayFee: 702,
    netSale: 21528,
    totalPayout: 21528,
    payoutExecuted: false,
    feesReceived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const statusConfig: Record<EventStatus, { color: string; icon: typeof CheckCircle2 }> = {
  Available: { color: 'status-available', icon: CheckCircle2 },
  Expired: { color: 'status-expired', icon: XCircle },
  Unavailable: { color: 'status-unavailable', icon: AlertTriangle },
  Finished: { color: 'status-finished', icon: Clock },
};

const EventsDashboard = () => {
  const [events] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesGateway = gatewayFilter === 'all' || event.gateway === gatewayFilter;
    return matchesSearch && matchesStatus && matchesGateway;
  });

  const handlePayoutToggle = (eventId: string, checked: boolean) => {
    console.log('Toggle payout:', eventId, checked);
    // Will be implemented with Supabase
  };

  const handleFeesToggle = (eventId: string, checked: boolean) => {
    console.log('Toggle fees:', eventId, checked);
    // Will be implemented with Supabase
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Events Management</h2>
          <p className="text-muted-foreground">Manage event lifecycles and payouts</p>
        </div>
        <Button className="bg-groovoo-gradient hover:opacity-90 shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-muted/50">
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
              <SelectTrigger className="w-full md:w-48 bg-muted/50">
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
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">
              Events ({filteredEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="overflow-x-auto">
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
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => {
                    const StatusIcon = statusConfig[event.status].icon;
                    return (
                      <TableRow key={event.id} className="border-border">
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {event.eventName}
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
                        <TableCell>{formatDate(event.eventDate)}</TableCell>
                        <TableCell>{formatDate(event.payoutDate)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(event.grossSale)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(event.serviceFee)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(event.gatewayFee)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(event.netSale)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatCurrency(event.totalPayout)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={event.payoutExecuted}
                            onCheckedChange={(checked) =>
                              handlePayoutToggle(event.id, checked as boolean)
                            }
                            className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={event.feesReceived}
                            onCheckedChange={(checked) =>
                              handleFeesToggle(event.id, checked as boolean)
                            }
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
                              <DropdownMenuItem>Edit Event</DropdownMenuItem>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>View Audit Log</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Delete Event
                              </DropdownMenuItem>
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
    </div>
  );
};

export default EventsDashboard;
