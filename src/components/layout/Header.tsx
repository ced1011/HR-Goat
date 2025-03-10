
import React, { useState } from 'react';
import { Bell, Menu, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  
  return (
    <header className="h-16 px-4 md:px-6 bg-white border-b border-hr-silver/20 sticky top-0 z-40 transition-all duration-300 glassmorphism">
      <div className="flex items-center justify-between h-full max-w-[1920px] mx-auto">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-full hover:bg-hr-silver/10 transition-colors md:hidden"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5 text-hr-text-primary" />
            ) : (
              <Menu className="h-5 w-5 text-hr-text-primary" />
            )}
          </button>
          
          <div onClick={() => navigate('/')} className="cursor-pointer select-none">
            <h1 className="text-xl font-medium tracking-tight">
              <span className="text-hr-blue">HR</span>Goat
            </h1>
          </div>
        </div>
        
        <div className={cn(
          "hidden md:flex items-center rounded-full bg-hr-silver/10 px-3 py-1.5 transition-all duration-300",
          searchFocused && "ring-2 ring-hr-blue/20 bg-white"
        )}>
          <Search className="h-4 w-4 text-hr-text-secondary mr-2" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none text-sm w-60 placeholder:text-hr-text-secondary"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-1.5 rounded-full hover:bg-hr-silver/10 transition-colors">
            <Bell className="h-5 w-5 text-hr-text-secondary" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-hr-blue rounded-full"></span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden ring-2 ring-hr-silver/30 transition-all hover:ring-hr-blue/30"
          >
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="User profile"
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
