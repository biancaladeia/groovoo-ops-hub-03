import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, User, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/events': 'Events Dashboard',
  '/dashboard/service-desk': 'Service Desk',
  '/dashboard/github-qa': 'GitHub & QA Integration',
  '/dashboard/audit': 'Audit Log',
  '/dashboard/wiki': 'Knowledge Base',
  '/dashboard/settings': 'Settings',
};

const Header = () => {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Dashboard';
  const { profile, role } = useAuth();
  const [notifications, setNotifications] = useState<AuditLog[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (sheetOpen) {
      fetchNotifications();
    }
  }, [sheetOpen]);

  const displayRole = role === 'admin' ? 'Admin' : 'Staff';
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
      <motion.h2
        key={title}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl font-semibold"
      >
        {title}
      </motion.h2>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 pl-10 bg-muted/50 border-border focus:border-primary"
          />
        </div>

        {/* Notifications */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary">
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Recent Activity
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-100px)] mt-4">
              {isLoadingNotifications ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{log.action}</p>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {log.entity_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.user_email || 'System'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{displayRole}</p>
          </div>
          <Avatar className="w-9 h-9 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
