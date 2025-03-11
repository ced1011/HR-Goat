
import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Reset sidebar open state when switching between mobile and desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false); // Reset mobile sidebar state when on desktop
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-hr-background">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isMobile ? sidebarOpen : undefined} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
