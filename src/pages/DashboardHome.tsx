import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Ticket, 
  CalendarDays, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    title: 'Total Gross Sales',
    value: '$124,580',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    title: 'Active Events',
    value: '23',
    change: '+3 this week',
    trend: 'up',
    icon: CalendarDays,
  },
  {
    title: 'Open Tickets',
    value: '47',
    change: '12 high priority',
    trend: 'neutral',
    icon: Ticket,
  },
  {
    title: 'Pending Payouts',
    value: '$45,230',
    change: '8 events',
    trend: 'neutral',
    icon: TrendingUp,
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'payout',
    title: 'Payout Executed',
    description: 'Summer Fest 2025 - $12,450',
    time: '2 hours ago',
    icon: CheckCircle2,
    iconColor: 'text-success',
  },
  {
    id: 2,
    type: 'ticket',
    title: 'High Priority Ticket',
    description: 'TKT-A1B2C - Duplicate charge reported',
    time: '4 hours ago',
    icon: AlertCircle,
    iconColor: 'text-destructive',
  },
  {
    id: 3,
    type: 'event',
    title: 'Event Created',
    description: 'Beach Party Night - Apr 15, 2025',
    time: '6 hours ago',
    icon: CalendarDays,
    iconColor: 'text-primary',
  },
  {
    id: 4,
    type: 'ticket',
    title: 'Ticket Resolved',
    description: 'TKT-X7Y8Z - Login issue fixed',
    time: '8 hours ago',
    icon: CheckCircle2,
    iconColor: 'text-success',
  },
];

const upcomingPayouts = [
  { event: 'Jazz Night Downtown', date: 'Feb 1, 2025', amount: '$8,750' },
  { event: 'Tech Conference 2025', date: 'Feb 3, 2025', amount: '$24,200' },
  { event: 'Comedy Club Special', date: 'Feb 5, 2025', amount: '$3,890' },
];

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card glow-hover">
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
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${activity.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Payouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Upcoming Payouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingPayouts.map((payout, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-sm">{payout.event}</p>
                    <p className="text-xs text-muted-foreground">{payout.date}</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {payout.amount}
                  </Badge>
                </div>
              ))}
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
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">89%</p>
                <p className="text-sm text-muted-foreground">SLA Compliance</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">156</p>
                <p className="text-sm text-muted-foreground">Tickets Resolved (MTD)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">4.2h</p>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-info">98.5%</p>
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
