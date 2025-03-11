import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  BarChart2,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Gauge,
  Activity,
  Database,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed';

const Sidebar = ({ isOpen = false }) => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  
  // Initialize collapsed state from localStorage or default to false (expanded)
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return savedState ? JSON.parse(savedState) : false;
  });
  
  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(collapsed));
  }, [collapsed]);
  
  // Use isOpen prop if provided (for mobile), otherwise use internal collapsed state
  const effectiveCollapsed = isOpen === undefined ? collapsed : !isOpen;

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Function to create a navigation link with consistent styling
  const NavItem = ({ to, icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
          isActive || (to === '/dashboard' && pathname === '/') 
            ? 'bg-accent text-accent-foreground' 
            : 'transparent'
        )
      }
    >
      {icon}
      {!effectiveCollapsed && <span>{label}</span>}
    </NavLink>
  );

  return (
    <>
      {/* Floating expand button when sidebar is collapsed */}
      {effectiveCollapsed && !isMobile && (
        <button
          onClick={handleToggleCollapse}
          className="fixed left-0 top-20 z-50 bg-primary text-primary-foreground p-2 rounded-r-md shadow-md hover:bg-primary/90 transition-all"
          aria-label="Expand Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      
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
              <NavItem 
                to="/dashboard" 
                icon={<Gauge className="h-4 w-4" />} 
                label="Dashboard" 
              />
              <NavItem 
                to="/employees" 
                icon={<Users className="h-4 w-4" />} 
                label="Employees" 
              />
              <NavItem 
                to="/payroll" 
                icon={<CreditCard className="h-4 w-4" />} 
                label="Payroll & Benefits" 
              />
              <NavItem 
                to="/performance" 
                icon={<Activity className="h-4 w-4" />} 
                label="Performance" 
              />
              <NavItem 
                to="/calendar" 
                icon={<Calendar className="h-4 w-4" />} 
                label="Calendar" 
              />
              <NavItem 
                to="/documents" 
                icon={<FileText className="h-4 w-4" />} 
                label="Documents" 
              />
              <NavItem 
                to="/reports" 
                icon={<BarChart2 className="h-4 w-4" />} 
                label="Reports" 
              />
            </nav>
          </ScrollArea>
          <div className="border-t p-4">
            <NavItem 
              to="/database-setup" 
              icon={<Database className="h-4 w-4" />} 
              label="Database Setup" 
            />
            <NavItem 
              to="/system-tools" 
              icon={<Terminal className="h-4 w-4" />} 
              label="System Tools" 
            />
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center items-center h-9 transition-all duration-200 mt-3"
              onClick={handleToggleCollapse}
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
    </>
  );
};

export default Sidebar;
