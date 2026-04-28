import React, { useMemo, useState } from 'react';
import { Product } from '../models';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import '../styles/components/DynamicFilters.scss';

interface DynamicFiltersProps {
  products: Product[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (specName: string, values: string[]) => void;
  onClearFilters: () => void;
}

interface SpecFilter {
  name: string;
  values: { value: string; count: number }[];
}

export const DynamicFilters: React.FC<DynamicFiltersProps> = ({
  products,
  activeFilters,
  onFilterChange,
  onClearFilters,
}) => {
  const [expandedSpecs, setExpandedSpecs] = useState<Set<string>>(new Set());

  // Собираем все уникальные характеристики из товаров
  const specFilters = useMemo<SpecFilter[]>(() => {
    const specsMap: Record<string, Map<string, number>> = {};
    
    products.forEach(product => {
      if (product.specs) {
        Object.entries(product.specs).forEach(([specName, specValue]) => {
          if (!specsMap[specName]) {
            specsMap[specName] = new Map();
          }
          const currentCount = specsMap[specName].get(specValue) || 0;
          specsMap[specName].set(specValue, currentCount + 1);
        });
      }
    });

    // Преобразуем в массив и сортируем
    return Object.entries(specsMap)
      .map(([name, valuesMap]) => ({
        name,
        values: Array.from(valuesMap.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count), // Сортировка по популярности
      }))
      .filter(spec => spec.values.length > 1) // Показываем только если есть больше 1 значения
      .sort((a, b) => b.values.length - a.values.length); // Сортировка по количеству вариантов
  }, [products]);

  const hasActiveFilters = Object.keys(activeFilters).some(key => activeFilters[key]?.length > 0);
  const totalActiveFilters = Object.values(activeFilters).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  const toggleSpec = (specName: string) => {
    setExpandedSpecs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(specName)) {
        newSet.delete(specName);
      } else {
        newSet.add(specName);
      }
      return newSet;
    });
  };

  const handleValueToggle = (specName: string, value: string) => {
    const currentValues = activeFilters[specName] || [];
    let newValues: string[];
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    onFilterChange(specName, newValues);
  };

  // Не показываем фильтры если товаров мало или нет характеристик
  if (products.length < 2 || specFilters.length === 0) {
    return null;
  }

  return (
    <aside className="dynamic-filters">
      <div className="filters-header">
        <div className="filters-title">
          <SlidersHorizontal size={18} />
          <h3>Фильтры</h3>
        </div>
        {hasActiveFilters && (
          <button className="clear-filters" onClick={onClearFilters}>
            <X size={14} />
            Сбросить ({totalActiveFilters})
          </button>
        )}
      </div>

      <div className="filters-list">
        {specFilters.map(spec => {
          const isExpanded = expandedSpecs.has(spec.name);
          const activeValues = activeFilters[spec.name] || [];
          const hasActiveValues = activeValues.length > 0;
          const displayedValues = isExpanded ? spec.values : spec.values.slice(0, 5);
          const hasMoreValues = spec.values.length > 5;

          return (
            <div 
              key={spec.name} 
              className={`filter-group ${hasActiveValues ? 'has-active' : ''}`}
            >
              <button 
                className="filter-group-header"
                onClick={() => toggleSpec(spec.name)}
              >
                <span className="filter-name">
                  {spec.name}
                  {hasActiveValues && (
                    <span className="active-count">({activeValues.length})</span>
                  )}
                </span>
                {hasMoreValues && (
                  isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </button>
              
              <div className="filter-values">
                {displayedValues.map(({ value, count }) => {
                  const isActive = activeValues.includes(value);
                  return (
                    <label 
                      key={value} 
                      className={`filter-value ${isActive ? 'active' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleValueToggle(spec.name, value)}
                      />
                      <span className="value-text">{value}</span>
                      <span className="value-count">{count}</span>
                    </label>
                  );
                })}
                {hasMoreValues && !isExpanded && (
                  <button 
                    className="show-more"
                    onClick={() => toggleSpec(spec.name)}
                  >
                    Показать ещё {spec.values.length - 5}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
