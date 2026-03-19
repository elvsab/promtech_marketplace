import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, User, LogIn, ShoppingCart, Box, Palette, ChevronRight } from 'lucide-react';
import { ViewType, Category, CATEGORIES } from '../models';
import '../styles/components/Header.scss';

interface HeaderProps {
  onToggleSidebar: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onSearch: (query: string) => void;
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
  onSelectCategory?: (categoryId: string | null) => void;
  onSelectSubcategory?: (subcategory: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  isLoggedIn, 
  onLoginClick,
  onSearch,
  onNavigate,
  currentView,
  onSelectCategory,
  onSelectSubcategory
}) => {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const categoriesSubmenuRef = useRef<HTMLDivElement>(null);
  const subcategoriesSubmenuRefs = useRef<Record<string, HTMLDivElement>>({});

  // Разделяем категории на товары и услуги
  const productCategories = CATEGORIES.filter(cat => cat.id !== 'services');
  const servicesCategory = CATEGORIES.find(cat => cat.id === 'services');

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsCategoriesMenuOpen(false);
        setHoveredCategory(null);
        setHoveredSubcategory(null);
      }
    };

    if (isCategoriesMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoriesMenuOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  const handleUserClick = () => {
    if (currentView === 'dashboard') {
      onNavigate('shop');
    } else {
      onNavigate('dashboard');
    }
  };

  const handleCategoryClick = (categoryId: string | null) => {
    // Переходим на главную страницу, если мы не на ней
    if (location.pathname !== '/') {
      onNavigate('shop');
    }
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    setIsCategoriesMenuOpen(false);
    setHoveredCategory(null);
    setHoveredSubcategory(null);
  };

  const handleSubcategoryClick = (subcategory: string | null) => {
    // Переходим на главную страницу, если мы не на ней
    if (location.pathname !== '/') {
      onNavigate('shop');
    }
    if (onSelectSubcategory) {
      onSelectSubcategory(subcategory);
    }
    setIsCategoriesMenuOpen(false);
    setHoveredCategory(null);
    setHoveredSubcategory(null);
  };

  return (
    <header className="header">
      <div className="container">
        
        {/* Left: Logo & Catalog Button */}
        <div className="left-section">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              <Box size={24} />
            </div>
            <span className="logo-text">
              PROM<span className="highlight">TECH</span>
            </span>
          </Link>

          <div className="catalog-menu-wrapper" ref={menuRef}>
            <button 
              onClick={() => setIsCategoriesMenuOpen(!isCategoriesMenuOpen)}
              className={`catalog-button ${currentView !== 'shop' ? 'disabled' : ''} ${isCategoriesMenuOpen ? 'active' : ''}`}
              disabled={currentView !== 'shop'}
            >
              <Menu size={18} />
              <span className="catalog-text">Категории</span>
            </button>

            {/* Выпадающее меню категорий */}
            {isCategoriesMenuOpen && currentView === 'shop' && (
              <div className="categories-dropdown">
                <div className="categories-menu">
                  {/* Товары */}
                  <div 
                    className="menu-section"
                    onMouseEnter={() => setHoveredCategory('products')}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="menu-section-header">
                      <span>Товары</span>
                      <ChevronRight size={16} />
                    </div>
                    {hoveredCategory === 'products' && (
                      <div 
                        ref={categoriesSubmenuRef}
                        className="submenu categories-submenu"
                      >
                        {productCategories.map(category => (
                          <div
                            key={category.id}
                            className="submenu-item"
                            onMouseEnter={(e) => {
                              console.log('Mouse enter category:', category.id, category.name);
                              setHoveredSubcategory(category.id);
                              // Позиционируем подменю подкатегорий с небольшой задержкой для правильного расчета размеров
                              setTimeout(() => {
                                const submenuEl = subcategoriesSubmenuRefs.current[category.id];
                                if (submenuEl && e.currentTarget) {
                                  const parentMenu = e.currentTarget.closest('.categories-submenu');
                                  if (parentMenu) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const parentRect = parentMenu.getBoundingClientRect();
                                    const viewportHeight = window.innerHeight;
                                    
                                    // Позиционируем подменю относительно родительского элемента
                                    const topOffset = rect.top - parentRect.top;
                                    submenuEl.style.top = `${topOffset}px`;
                                    submenuEl.style.bottom = 'auto';
                                    
                                    // Проверяем, не выходит ли подменю за нижнюю границу экрана
                                    const submenuRect = submenuEl.getBoundingClientRect();
                                    if (submenuRect.bottom > viewportHeight) {
                                      const overflow = submenuRect.bottom - viewportHeight;
                                      submenuEl.style.top = `${Math.max(0, topOffset - overflow - 10)}px`;
                                    }
                                  }
                                }
                              }, 10);
                            }}
                            onMouseLeave={(e) => {
                              // Не скрываем подменю, если мышь переходит на само подменю
                              const relatedTarget = e.relatedTarget as HTMLElement;
                              if (relatedTarget && relatedTarget.closest('.subcategories-submenu')) {
                                return;
                              }
                              setHoveredSubcategory(null);
                            }}
                          >
                            <span 
                              className="submenu-link"
                              onClick={() => handleCategoryClick(category.id)}
                            >
                              {category.name}
                            </span>
                            {category.subcategories && category.subcategories.length > 0 && (
                              <ChevronRight size={14} />
                            )}
                            {hoveredSubcategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                              <div 
                                ref={(el) => {
                                  if (el) subcategoriesSubmenuRefs.current[category.id] = el;
                                }}
                                className="submenu subcategories-submenu"
                                onMouseEnter={() => setHoveredSubcategory(category.id)}
                                onMouseLeave={() => setHoveredSubcategory(null)}
                              >
                                {category.subcategories.map(subcategory => (
                                  <div
                                    key={subcategory}
                                    className="submenu-subcategory-item"
                                    onClick={() => handleSubcategoryClick(subcategory)}
                                  >
                                    <span className="submenu-link">
                                      {subcategory}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Услуги */}
                  {servicesCategory && (
                    <div 
                      className="menu-section"
                      onMouseEnter={() => setHoveredCategory('services')}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="menu-section-header">
                        <span>Услуги</span>
                        {servicesCategory.subcategories && servicesCategory.subcategories.length > 0 && (
                          <ChevronRight size={16} />
                        )}
                      </div>
                      {hoveredCategory === 'services' && servicesCategory.subcategories && servicesCategory.subcategories.length > 0 && (
                        <div className="submenu subcategories-submenu services-submenu">
                          {servicesCategory.subcategories.map(subcategory => (
                            <div
                              key={subcategory}
                              className="submenu-subcategory-item"
                              onClick={() => handleSubcategoryClick(subcategory)}
                            >
                              <span className="submenu-link">
                                {subcategory}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="search-section">
          {currentView === 'shop' && (
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Поиск оборудования по названию, артикулу..." 
                className="search-input"
                value={searchValue}
                onChange={handleSearchChange}
              />
              <Search className="search-icon" size={18} />
            </div>
          )}
        </div>

        {/* Right: User Actions */}
        <div className="right-section">
          
          {/* Design System Toggle for Demo 
          <Link
            to={location.pathname === '/design-system' ? '/' : '/design-system'}
            className={`palette-button ${currentView === 'design-system' ? 'active' : ''}`}
            title="Toggle Design System / UI Kit"
          >
            <Palette size={20} />
          </Link>
            
          <button className="cart-button">
            <ShoppingCart size={22} />
            <span className="cart-badge">2</span>
          </button>
            */}
          {isLoggedIn ? (
            <Link
              to={location.pathname === '/dashboard' ? '/' : '/dashboard'}
              className={`user-button ${currentView === 'dashboard' ? 'active' : ''}`}
            >
              <div className="user-avatar">
                <User size={18} />
              </div>
              <span className="user-text">
                {currentView === 'dashboard' ? 'Назад' : 'Кабинет'}
              </span>
            </Link>
          ) : (
            <button 
              onClick={onLoginClick}
              className="login-button"
            >
              <LogIn size={16} />
              <span className="login-text">Вход</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
