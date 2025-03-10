
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
  Terminal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Sidebar = ({ isOpen = false }) => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  
  // Use isOpen prop if provided, otherwise use internal collapsed state
  const effectiveCollapsed = isOpen === undefined ? collapsed : !isOpen;

  return (
    <div
      className={cn(
        'border-r bg-background transition-all duration-300 ease-in-out',
        {
          'w-64': !effectiveCollapsed,
          'w-[70px]': effectiveCollapsed,
          'fixed inset-y-[64px] left-0 z-30 shadow-lg': isMobile,
          'relative': !isMobile,
          'translate-x-0': !effectiveCollapsed,
          '-translate-x-full': isMobile && effectiveCollapsed,
        }
      )}
    >
      <div className="flex h-full flex-col">
        <ScrollArea className="flex-1 py-4">
          <nav className="grid items-start gap-2 px-3 text-sm font-medium">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive || pathname == '/'
                    ? 'bg-accent text-accent-foreground'
                    : 'transparent'
                )
              }
            >
              <Gauge className="h-4 w-4" />
              {!effectiveCollapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink
              to="/employees"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <Users className="h-4 w-4" />
              {!effectiveCollapsed && <span>Employees</span>}
            </NavLink>
            <NavLink
              to="/payroll"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <CreditCard className="h-4 w-4" />
              {!effectiveCollapsed && <span>Payroll & Benefits</span>}
            </NavLink>
            <NavLink
              to="/performance"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <Activity className="h-4 w-4" />
              {!effectiveCollapsed && <span>Performance</span>}
            </NavLink>
            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <Calendar className="h-4 w-4" />
              {!effectiveCollapsed && <span>Calendar</span>}
            </NavLink>
            <NavLink
              to="/documents"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <FileText className="h-4 w-4" />
              {!effectiveCollapsed && <span>Documents</span>}
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <BarChart2 className="h-4 w-4" />
              {!effectiveCollapsed && <span>Reports</span>}
            </NavLink>
            <NavLink
              to="/database-setup"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <Database className="h-4 w-4" />
              {!effectiveCollapsed && <span>Database Setup</span>}
            </NavLink>
            <NavLink
              to="/system-tools"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )
              }
            >
              <Terminal className="h-4 w-4" />
              {!effectiveCollapsed && <span>System Tools</span>}
            </NavLink>
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 mb-3 transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive ? 'bg-accent text-accent-foreground' : 'transparent'
              )
            }
          >
            <Settings className="h-4 w-4" />
            {!effectiveCollapsed && <span>Settings</span>}
          </NavLink>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center items-center h-9 transition-all duration-200"
            onClick={() => setCollapsed(!collapsed)}
          >
            {effectiveCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            {!effectiveCollapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
