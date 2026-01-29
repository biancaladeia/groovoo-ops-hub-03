import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  History,
  User,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  CheckCircle2,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/utils';
import { AuditLog } from '@/types';

// Mock data
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Davis',
    action: 'PAYOUT_EXECUTED',
    entityType: 'Event',
    entityId: 'Summer Music Festival 2025',
    oldValue: 'Pending',
    newValue: 'Executed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Sarah Miller',
    action: 'TICKET_RESOLVED',
    entityType: 'Ticket',
    entityId: 'TKT-M7X2Y-A1B2',
    oldValue: 'In Progress',
    newValue: 'Resolved',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '3',
    userId: 'user1',
    userName: 'John Davis',
    action: 'FEES_RECEIVED',
    entityType: 'Event',
    entityId: 'Jazz Night Downtown',
    oldValue: 'false',
    newValue: 'true',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: '4',
    userId: 'user3',
    userName: 'Mike Roberts',
    action: 'EVENT_CREATED',
    entityType: 'Event',
    entityId: 'Tech Conference 2025',
    oldValue: undefined,
    newValue: 'Created',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    userId: 'user2',
    userName: 'Sarah Miller',
    action: 'STATUS_CHANGED',
    entityType: 'Event',
    entityId: 'Comedy Club Night',
    oldValue: 'Available',
    newValue: 'Expired',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: '6',
    userId: 'user4',
    userName: 'Emily Turner',
    action: 'TICKET_ASSIGNED',
    entityType: 'Ticket',
    entityId: 'TKT-N8Y3Z-B2C3',
    oldValue: 'Unassigned',
    newValue: 'Sarah Miller',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
];

const actionConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  PAYOUT_EXECUTED: { icon: DollarSign, color: 'text-success', label: 'Payout Executed' },
  FEES_RECEIVED: { icon: DollarSign, color: 'text-success', label: 'Fees Received' },
  TICKET_RESOLVED: { icon: CheckCircle2, color: 'text-success', label: 'Ticket Resolved' },
  TICKET_ASSIGNED: { icon: User, color: 'text-info', label: 'Ticket Assigned' },
  EVENT_CREATED: { icon: FileText, color: 'text-primary', label: 'Event Created' },
  STATUS_CHANGED: { icon: Edit, color: 'text-warning', label: 'Status Changed' },
  EVENT_DELETED: { icon: Trash2, color: 'text-destructive', label: 'Event Deleted' },
};

const AuditLogPage = () => {
  const [logs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          Audit Log
        </h2>
        <p className="text-muted-foreground">Track all changes and actions in the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.length}</p>
              <p className="text-xs text-muted-foreground">Total Actions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {logs.filter((l) => l.action === 'PAYOUT_EXECUTED').length}
              </p>
              <p className="text-xs text-muted-foreground">Payouts Executed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {logs.filter((l) => l.action === 'TICKET_RESOLVED').length}
              </p>
              <p className="text-xs text-muted-foreground">Tickets Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <Edit className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {logs.filter((l) => l.action === 'STATUS_CHANGED').length}
              </p>
              <p className="text-xs text-muted-foreground">Status Changes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by entity or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-48 bg-muted/50">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="PAYOUT_EXECUTED">Payout Executed</SelectItem>
                <SelectItem value="FEES_RECEIVED">Fees Received</SelectItem>
                <SelectItem value="TICKET_RESOLVED">Ticket Resolved</SelectItem>
                <SelectItem value="STATUS_CHANGED">Status Changed</SelectItem>
                <SelectItem value="EVENT_CREATED">Event Created</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full md:w-48 bg-muted/50">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="Event">Events</SelectItem>
                <SelectItem value="Ticket">Tickets</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">
              Activity History ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Timestamp
                      </div>
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log, index) => {
                    const config = actionConfig[log.action] || {
                      icon: FileText,
                      color: 'text-muted-foreground',
                      label: log.action,
                    };
                    const Icon = config.icon;

                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-border hover:bg-muted/30"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDateTime(log.timestamp)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">
                              {log.userName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium">{log.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${config.color} bg-opacity-10 flex items-center gap-1 w-fit`}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="outline" className="text-xs mb-1">
                              {log.entityType}
                            </Badge>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {log.entityId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            {log.oldValue && (
                              <>
                                <span className="text-muted-foreground line-through">
                                  {log.oldValue}
                                </span>
                                <span className="text-muted-foreground">→</span>
                              </>
                            )}
                            <span className="text-foreground font-medium">
                              {log.newValue}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
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

export default AuditLogPage;
