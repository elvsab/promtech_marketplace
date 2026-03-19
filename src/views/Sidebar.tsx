import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Filter, X } from 'lucide-react';
import { Category, CATEGORIES } from '../models';
import '../styles/components/Sidebar.scss';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onSelectSubcategory: (subcategory: string | null) => void;
  categories?: Category[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose,
  selectedCategory, 
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  categories = CATEGORIES // Fallback to constants if not provided
}) => {
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleCategoryClick = (catId: string | null) => {
    onSelectCategory(catId);
    onSelectSubcategory(null); // Сбрасываем подкатегорию при выборе категории
  };

  const handleSubcategoryClick = (subcategory: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectSubcategory(subcategory);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="header">
          <h2 className="header-title">
            <Filter size={20} />
            Категории
          </h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <button
                onClick={() => {
                  handleCategoryClick(null);
                  onClose();
                }}
                className={`all-products-button ${selectedCategory === null && selectedSubcategory === null ? 'active' : ''}`}
              >
                Все товары
              </button>
            </li>
            {categories.filter(cat => cat.id !== 'services').map((cat: Category) => (
              <li key={cat.id} className="nav-item">
                <div 
                  className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <span className={`category-name ${selectedCategory === cat.id ? 'active' : ''}`}>
                    {cat.name}
                  </span>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <button 
                      onClick={(e) => toggleExpand(cat.id, e)}
                      className="expand-button"
                    >
                      {expandedCats[cat.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  )}
                </div>

                {/* Subcategories Accordion */}
                {expandedCats[cat.id] && cat.subcategories && cat.subcategories.length > 0 && (
                  <ul className="subcategories-list">
                    {cat.subcategories.map(sub => (
                      <li key={sub}>
                        <button
                          onClick={(e) => {
                            handleSubcategoryClick(sub, e);
                            onClose();
                          }}
                          className={`subcategory-link ${selectedSubcategory === sub ? 'active' : ''}`}
                        >
                          {sub}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Banner or extra info in sidebar */}
        <div className="banner">
          <p className="banner-title">Нужна консультация?</p>
          <p className="banner-text">Наши инженеры помогут подобрать оборудование.</p>
          <button className="banner-button">
            Заказать звонок
          </button>
        </div>
      </aside>
    </>
  );
};
