import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Package,
  FolderTree,
  Tag,
  Download,
  Gift,
  Trash2,
  RotateCcw,
  Settings,
  Bell,
  BarChart3,
  MessageSquare,
  Users,
  ChevronRight,
  Search,
} from 'lucide-react';
import '../styles/components/DashboardSidebar.scss';

interface DashboardSidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    company_name?: string;
  };
  isCollapsed?: boolean;
  onCollapse?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavItem[];
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ user, isCollapsed = false, onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['products']);

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Главная',
      icon: <Home size={18} />,
      path: '/dashboard',
    },
    {
      id: 'orders',
      label: 'Заказы и сообщения',
      icon: <ShoppingCart size={18} />,
      path: '/dashboard/orders',
    },
    {
      id: 'products',
      label: 'Товары и услуги',
      icon: <Package size={18} />,
      path: '/dashboard/products',
      children: [
        {
          id: 'products-positions',
          label: 'Позиции',
          icon: <Package size={16} />,
          path: '/dashboard/products/positions',
        },
        {
          id: 'products-groups',
          label: 'Группы и подборки',
          icon: <FolderTree size={16} />,
          path: '/dashboard/groups',
        },
        {
          id: 'products-categories',
          label: 'Категории',
          icon: <Tag size={16} />,
          path: '/dashboard/products/categories',
        },
        {
          id: 'products-import',
          label: 'Импорт',
          icon: <Download size={16} />,
          path: '/dashboard/products/import',
        },
        {
          id: 'products-promotions',
          label: 'Акции и промокоды',
          icon: <Gift size={16} />,
          path: '/dashboard/products/promotions',
        },
        {
          id: 'products-deleted',
          label: 'Удаленные позиции',
          icon: <Trash2 size={16} />,
          path: '/dashboard/products/deleted',
        },
        {
          id: 'products-restore',
          label: 'Восстановление позиций',
          icon: <RotateCcw size={16} />,
          path: '/dashboard/products/restore',
        },
        {
          id: 'products-characteristics',
          label: 'Характеристики',
          icon: <Settings size={16} />,
          path: '/dashboard/products/characteristics',
        },
      ],
    },
    {
      id: 'notifications',
      label: 'Уведомления',
      icon: <Bell size={18} />,
      path: '/dashboard/notifications',
    },
    {
      id: 'analytics',
      label: 'Показатели работы',
      icon: <BarChart3 size={18} />,
      path: '/dashboard/analytics',
    },
    {
      id: 'reviews',
      label: 'Отзывы',
      icon: <MessageSquare size={18} />,
      path: '/dashboard/reviews',
    },
    {
      id: 'buyers',
      label: 'Покупатели',
      icon: <Users size={18} />,
      path: '/dashboard/buyers',
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* User Info */}
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{user.company_name || user.name || 'Пользователь'}</div>
            <div className="user-id">Ваш ID: {user.id.slice(0, 6)}</div>
          </div>
        </div>
        {onCollapse && (
          <button className="collapse-button" onClick={onCollapse}>
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <Search size={16} />
        <input type="text" placeholder="Поиск" />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.id);
          const itemActive = isActive(item.path);

          return (
            <div key={item.id} className="nav-section">
              <div
                className={`nav-item ${itemActive ? 'active' : ''} ${hasChildren ? 'has-children' : ''}`}
                onClick={() => {
                  if (hasChildren) {
                    toggleExpanded(item.id);
                  } else {
                    handleNavigate(item.path);
                  }
                }}
              >
                <div className="nav-item-content">
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
                {hasChildren && (
                  <ChevronRight
                    size={16}
                    className={`chevron ${isExpanded ? 'expanded' : ''}`}
                  />
                )}
              </div>

              {hasChildren && isExpanded && (
                <div className="nav-children">
                  {item.children!.map((child) => {
                    const childActive = isActive(child.path);
                    return (
                      <div
                        key={child.id}
                        className={`nav-item child ${childActive ? 'active' : ''}`}
                        onClick={() => handleNavigate(child.path)}
                      >
                        <div className="nav-item-content">
                          <span className="nav-icon">{child.icon}</span>
                          <span className="nav-label">{child.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Button at Bottom */}
      <div className="sidebar-footer">
        {onCollapse && (
          <button className="collapse-button-bottom" onClick={onCollapse}>
            <ChevronRight size={16} />
            Свернуть
          </button>
        )}
      </div>
    </div>
  );
};

