
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  BarChart2,
  Users,
  Calendar,
  FileText,
  Settings,
  CreditCard,
  Gauge,
  Activity,
  Database,
} from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

const Sidebar = () => {
  const { pathname } = useLocation();
  const isMobile = useMobile();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'border-r bg-background transition-all duration-300 ease-in-out',
        {
          'w-64': !collapsed,
          'w-[70px]': collapsed,
          'fixed inset-y-[64px] left-0 z-30': isMobile,
          'relative': !isMobile,
          'translate-x-0': !collapsed,
          '-translate-x-full': isMobile && collapsed,
        }
      )}
    >
      <div className="flex h-full flex-col">
        <ScrollArea className="flex-1 py-2">
          <nav className="grid items-start gap-1 px-2 text-sm font-medium">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground',
                  isActive || pathname == '/'
                    ? 'bg-accent text-accent-foreground'
                    : 'transparent'
                )
              }
            >
              <Gauge className="h-4 w-4" />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink
              to="/employees"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <Users className="h-4 w-4" />
              {!collapsed && <span>Employees</span>}
            </NavLink>
            <NavLink
              to="/payroll"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <CreditCard className="h-4 w-4" />
              {!collapsed && <span>Payroll & Benefits</span>}
            </NavLink>
            <NavLink
              to="/performance"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <Activity className="h-4 w-4" />
              {!collapsed && <span>Performance</span>}
            </NavLink>
            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <Calendar className="h-4 w-4" />
              {!collapsed && <span>Calendar</span>}
            </NavLink>
            <NavLink
              to="/documents"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <FileText className="h-4 w-4" />
              {!collapsed && <span>Documents</span>}
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <BarChart2 className="h-4 w-4" />
              {!collapsed && <span>Reports</span>}
            </NavLink>
            <NavLink
              to="/database-setup"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <Database className="h-4 w-4" />
              {!collapsed && <span>Database Setup</span>}
            </NavLink>
          </nav>
        </ScrollArea>
        <div className="border-t p-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground',
                isActive ? 'bg-accent text-accent-foreground' : 'transparent'
              )
            }
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '→' : '←'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
