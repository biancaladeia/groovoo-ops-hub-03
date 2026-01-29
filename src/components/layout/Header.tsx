import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
  
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { email: 'user@groovoo.com', role: 'Operations Manager' };

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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary">
            3
          </Badge>
        </Button>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.email.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <Avatar className="w-9 h-9 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/20 text-primary">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
