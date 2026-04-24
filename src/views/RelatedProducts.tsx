import React from 'react';
import { Product } from '../models';
import { Package, ShoppingCart, ArrowRight } from 'lucide-react';
import '../styles/components/RelatedProducts.scss';

interface RelatedProductsProps {
  products: Product[];
  currentProducts: Product[];
  searchQuery: string;
  onProductClick?: (product: Product) => void;
}

// Функция для определения сопутствующих товаров на основе категории
const getRelatedCategories = (category: string): string[] => {
  const relatedMap: Record<string, string[]> = {
    'machinery': ['parts-components', 'measurement-control', 'welding-thermal'],
    'cnc-automation': ['electrical', 'parts-components', 'measurement-control'],
    'electrical': ['cnc-automation', 'pumps-compressors', 'parts-components'],
    'pumps-compressors': ['electrical', 'parts-components', 'conveyors-lifting'],
    'conveyors-lifting': ['pumps-compressors', 'electrical', 'parts-components'],
    'material-processing': ['conveyors-lifting', 'electrical', 'parts-components'],
    'welding-thermal': ['machinery', 'electrical', 'parts-components'],
    'measurement-control': ['cnc-automation', 'machinery', 'parts-components'],
    'packaging-logistics': ['conveyors-lifting', 'electrical', 'parts-components'],
    'parts-components': ['machinery', 'electrical', 'pumps-compressors'],
  };
  return relatedMap[category] || [];
};

// Функция для получения названия категории
const getCategoryName = (categoryId: string): string => {
  const categoryNames: Record<string, string> = {
    'machinery': 'Станки и металлообработка',
    'cnc-automation': 'Оборудование с ЧПУ',
    'electrical': 'Электротехника',
    'pumps-compressors': 'Насосы и компрессоры',
    'conveyors-lifting': 'Конвейеры и подъемное',
    'material-processing': 'Обработка материалов',
    'welding-thermal': 'Сварочное оборудование',
    'measurement-control': 'Измерительное оборудование',
    'packaging-logistics': 'Упаковка и логистика',
    'parts-components': 'Запчасти и комплектующие',
  };
  return categoryNames[categoryId] || categoryId;
};

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
  currentProducts,
  searchQuery,
  onProductClick,
}) => {
  // Определяем категории текущих отфильтрованных товаров
  const currentCategories = [...new Set(currentProducts.map(p => p.category))];
  
  // Получаем сопутствующие категории
  const relatedCategoriesSet = new Set<string>();
  currentCategories.forEach(cat => {
    getRelatedCategories(cat).forEach(related => {
      if (!currentCategories.includes(related)) {
        relatedCategoriesSet.add(related);
      }
    });
  });
  
  // Находим товары из сопутствующих категорий
  const relatedCategoryProducts = products.filter(
    p => relatedCategoriesSet.has(p.category) && !currentProducts.some(cp => cp.id === p.id)
  );
  
  // Группируем по категориям и берём по 2 товара из каждой
  const groupedRelated: Record<string, Product[]> = {};
  relatedCategoryProducts.forEach(product => {
    if (!groupedRelated[product.category]) {
      groupedRelated[product.category] = [];
    }
    if (groupedRelated[product.category].length < 2) {
      groupedRelated[product.category].push(product);
    }
  });
  
  // Проверяем, есть ли что показывать
  const hasRelatedProducts = Object.keys(groupedRelated).length > 0;
  
  // Показываем только если есть поисковый запрос или фильтрация, и есть сопутствующие товары
  const isFiltering = searchQuery || currentProducts.length !== products.length;
  
  if (!isFiltering || !hasRelatedProducts) {
    return null;
  }

  return (
    <aside className="related-products">
      <div className="related-header">
        <Package size={18} />
        <h3>Сопутствующие товары</h3>
      </div>
      
      <p className="related-description">
        Товары, которые часто покупают вместе с выбранными
      </p>
      
      {Object.entries(groupedRelated).map(([category, categoryProducts]) => (
        <div key={category} className="related-category">
          <h4 className="category-title">{getCategoryName(category)}</h4>
          <div className="related-items">
            {categoryProducts.map(product => (
              <div 
                key={product.id} 
                className="related-item"
                onClick={() => onProductClick?.(product)}
              >
                <div className="item-image">
                  <img src={product.imageUrl} alt={product.name} />
                </div>
                <div className="item-info">
                  <span className="item-name">{product.name}</span>
                  <span className="item-price">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <button className="item-action" title="Подробнее">
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="related-banner">
        <ShoppingCart size={20} />
        <span>Добавьте сопутствующие товары для комплексной поставки</span>
      </div>
    </aside>
  );
};
