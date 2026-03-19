import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { User } from '../models';
import '../styles/components/DashboardLayout.scss';

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        user={user}
        isCollapsed={isSidebarCollapsed}
        onCollapse={toggleSidebar}
      />
      <div className={`dashboard-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <button
          className={`sidebar-toggle-button ${isSidebarCollapsed ? 'collapsed' : ''}`}
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
        {children}
      </div>
    </div>
  );
};
