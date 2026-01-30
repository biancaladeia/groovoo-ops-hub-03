import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Ticket, 
  CalendarDays, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AuditLog } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalGrossSales: number;
  activeEventsCount: number;
  openTicketsCount: number;
  highPriorityTicketsCount: number;
  pendingPayoutsTotal: number;
  pendingPayoutsCount: number;
  resolvedTicketsMTD: number;
}

interface UpcomingPayout {
  event_name: string;
  payout_date: string;
  total_payout: number;
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [upcomingPayouts, setUpcomingPayouts] = useState<UpcomingPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch events for stats
      const { data: events } = await supabase.from('events').select('*');
      
      // Fetch tickets for stats
      const { data: tickets } = await supabase.from('tickets').select('*');
      
      // Fetch recent audit logs
      const { data: auditLogs } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch upcoming payouts (events not yet paid out)
      const { data: pendingEvents } = await supabase
        .from('events')
        .select('event_name, payout_date, total_payout')
        .eq('payout_executed', false)
        .order('payout_date', { ascending: true })
        .limit(3);

      // Calculate stats
      const finishedEvents = events?.filter(e => e.status === 'Finished') || [];
      const availableEvents = events?.filter(e => e.status === 'Available') || [];
      const unpaidEvents = events?.filter(e => !e.payout_executed) || [];
      const openTickets = tickets?.filter(t => t.status === 'Open') || [];
      const highPriorityOpen = tickets?.filter(t => t.priority === 'High' && t.status !== 'Closed' && t.status !== 'Resolved') || [];
      
      // Calculate month-to-date resolved tickets
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const resolvedMTD = tickets?.filter(t => 
        (t.status === 'Resolved' || t.status === 'Closed') && 
        new Date(t.resolved_at || t.updated_at) >= startOfMonth
      ) || [];

      setStats({
        totalGrossSales: finishedEvents.reduce((sum, e) => sum + Number(e.net_sale || 0), 0),
        activeEventsCount: availableEvents.length,
        openTicketsCount: openTickets.length,
        highPriorityTicketsCount: highPriorityOpen.length,
        pendingPayoutsTotal: unpaidEvents.reduce((sum, e) => sum + Number(e.total_payout || 0), 0),
        pendingPayoutsCount: unpaidEvents.length,
        resolvedTicketsMTD: resolvedMTD.length,
      });

      setRecentActivity(auditLogs || []);
      setUpcomingPayouts(pendingEvents || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Net Sales',
      value: formatCurrency(stats?.totalGrossSales || 0),
      change: 'Finished events',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Active Events',
      value: stats?.activeEventsCount.toString() || '0',
      change: 'Currently available',
      trend: 'up',
      icon: CalendarDays,
    },
    {
      title: 'Open Tickets',
      value: stats?.openTicketsCount.toString() || '0',
      change: `${stats?.highPriorityTicketsCount || 0} high priority`,
      trend: 'neutral',
      icon: Ticket,
    },
    {
      title: 'Pending Payouts',
      value: formatCurrency(stats?.pendingPayoutsTotal || 0),
      change: `${stats?.pendingPayoutsCount || 0} events`,
      trend: 'neutral',
      icon: TrendingUp,
    },
  ];

  const getActivityIcon = (action: string) => {
    if (action.toLowerCase().includes('payout')) return { icon: CheckCircle2, color: 'text-success' };
    if (action.toLowerCase().includes('ticket')) return { icon: AlertCircle, color: 'text-warning' };
    if (action.toLowerCase().includes('event')) return { icon: CalendarDays, color: 'text-primary' };
    return { icon: Clock, color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="clean-card glow-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {stat.trend === 'up' && (
                          <ArrowUpRight className="w-3 h-3 text-success" />
                        )}
                        {stat.change}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="clean-card h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity
                </div>
              ) : (
                recentActivity.map((activity) => {
                  const { icon: Icon, color } = getActivityIcon(activity.action);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.entity_type}: {activity.entity_id.slice(0, 8)}...
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Payouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="clean-card h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Upcoming Payouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingPayouts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No pending payouts
                </div>
              ) : (
                upcomingPayouts.map((payout, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-sm">{payout.event_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(new Date(payout.payout_date))}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {formatCurrency(Number(payout.total_payout))}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="clean-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">
                  {stats?.resolvedTicketsMTD || 0}
                </p>
                <p className="text-sm text-muted-foreground">Tickets Resolved (MTD)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {stats?.activeEventsCount || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Events</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">
                  {stats?.highPriorityTicketsCount || 0}
                </p>
                <p className="text-sm text-muted-foreground">High Priority Open</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-info">
                  {stats?.pendingPayoutsCount || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
