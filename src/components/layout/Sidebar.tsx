
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  HelpCircle, 
  LogOut,
  BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
}

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: Calendar, label: 'Time Off', path: '/time-off' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: BarChart, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-hr-silver/20 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full py-6">
        <div className="px-6 mb-8">
          <div className="text-2xl font-semibold tracking-tight">
            <span className="text-hr-blue">HR</span> Symphony
          </div>
          <p className="text-hr-text-secondary text-sm mt-1">Employee Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center w-full px-2 py-2.5 rounded-lg text-sm transition-all duration-200",
                location.pathname === item.path
                  ? "bg-hr-blue text-white"
                  : "text-hr-text-secondary hover:bg-hr-silver/10 hover:text-hr-text-primary"
              )}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span>{item.label}</span>
              {item.path === location.pathname && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white/60" />
              )}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto px-4 space-y-1">
          <button className="flex items-center w-full px-2 py-2.5 rounded-lg text-sm transition-all duration-200 text-hr-text-secondary hover:bg-hr-silver/10 hover:text-hr-text-primary">
            <HelpCircle className="h-4 w-4 mr-3" />
            <span>Help & Support</span>
          </button>
          
          <button className="flex items-center w-full px-2 py-2.5 rounded-lg text-sm transition-all duration-200 text-hr-text-secondary hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
