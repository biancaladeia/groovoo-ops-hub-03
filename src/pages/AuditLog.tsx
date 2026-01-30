import { useState, useEffect } from 'react';
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
  Loader2,
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const actionConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  'Payout Status Changed': { icon: DollarSign, color: 'text-success', label: 'Payout Executed' },
  'Fees Status Changed': { icon: DollarSign, color: 'text-success', label: 'Fees Received' },
  'TICKET_RESOLVED': { icon: CheckCircle2, color: 'text-success', label: 'Ticket Resolved' },
  'TICKET_ASSIGNED': { icon: User, color: 'text-info', label: 'Ticket Assigned' },
  'EVENT_CREATED': { icon: FileText, color: 'text-primary', label: 'Event Created' },
  'STATUS_CHANGED': { icon: Edit, color: 'text-warning', label: 'Status Changed' },
  'EVENT_DELETED': { icon: Trash2, color: 'text-destructive', label: 'Event Deleted' },
};

const AuditLogPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.entity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

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
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <History className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          Audit Log
        </h2>
        <p className="text-sm text-muted-foreground">Track all changes and actions in the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
        <Card className="clean-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold">{logs.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="clean-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-success" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold">
                {logs.filter((l) => l.action === 'Payout Status Changed').length}
              </p>
              <p className="text-xs text-muted-foreground">Payouts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="clean-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-info" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold">
                {logs.filter((l) => l.action === 'Fees Status Changed').length}
              </p>
              <p className="text-xs text-muted-foreground">Fees</p>
            </div>
          </CardContent>
        </Card>
        <Card className="clean-card">
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Edit className="w-4 h-4 md:w-5 md:h-5 text-warning" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-bold">
                {logs.filter((l) => l.entity_type === 'event').length}
              </p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="clean-card">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by entity or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-background text-sm">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="Payout Status Changed">Payout Executed</SelectItem>
                  <SelectItem value="Fees Status Changed">Fees Received</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-background text-sm">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="ticket">Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table/Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="clean-card overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">
              Activity History ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            {/* Mobile View */}
            <div className="md:hidden space-y-3 p-4">
              {filteredLogs.map((log, index) => {
                const config = actionConfig[log.action] || {
                  icon: FileText,
                  color: 'text-muted-foreground',
                  label: log.action,
                };
                const Icon = config.icon;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className={`${config.color} bg-opacity-10 flex items-center gap-1`}
                      >
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(new Date(log.created_at))}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{log.user_email || 'System'}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">{log.entity_type}</Badge>
                      <span className="text-muted-foreground truncate">{log.entity_id}</span>
                    </div>
                    {(log.old_value || log.new_value) && (
                      <div className="mt-2 text-xs">
                        {log.old_value && (
                          <span className="text-muted-foreground">
                            {JSON.stringify(log.old_value)} →{' '}
                          </span>
                        )}
                        <span className="font-medium">{JSON.stringify(log.new_value)}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
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
                              {formatDateTime(new Date(log.created_at))}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
                              {(log.user_email?.charAt(0) || 'S').toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{log.user_email || 'System'}</span>
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
                              {log.entity_type}
                            </Badge>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {log.entity_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            {log.old_value && (
                              <>
                                <span className="text-muted-foreground line-through">
                                  {JSON.stringify(log.old_value)}
                                </span>
                                <span className="text-muted-foreground">→</span>
                              </>
                            )}
                            <span className="text-foreground font-medium">
                              {JSON.stringify(log.new_value)}
                            </span>
                          </div>
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

      {logs.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No audit logs found. Changes will be recorded automatically.</p>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
