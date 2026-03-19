import { useState } from 'react';
import { ViewType } from '../models';

export const useNavigation = (initialView: ViewType = 'shop') => {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (view: ViewType) => {
    setCurrentView(view);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return {
    currentView,
    isSidebarOpen,
    navigate,
    toggleSidebar,
    closeSidebar,
    setSidebarOpen
  };
};



