import React, { useState, useEffect } from 'react';
import { ProductCard, ProductModal, RelatedProducts } from '../views';
import { ShopPresenter } from '../presenters';
import { useAppDispatch, useAppSelector } from '../store';
import { searchProducts, resetFilters } from '../store';
import { Product } from '../models';
import '../styles/App.scss';

interface ShopPageProps {
  categories: ReturnType<typeof import('../hooks').useCategories>;
  onLoginRequired?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ categories, onLoginRequired }) => {
  const dispatch = useAppDispatch();
  const searchState = useAppSelector((state) => state.search);
  const categoriesState = useAppSelector((state) => state.categories);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  const selectedCategory = categoriesState.selectedCategoryId;
  const selectedSubcategory = categoriesState.selectedSubcategory;
  const hasProducts = searchState.filteredProducts.length > 0;

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[ShopPage] Состояние товаров:', {
        allProducts: searchState.products.length,
        filteredProducts: searchState.filteredProducts.length,
        isLoading: searchState.isLoading,
        error: searchState.error,
        filters: searchState.filters,
        searchQuery: searchState.searchQuery
      });
    }
  }, [searchState]);

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleRequestQuote = (product: Product) => {
    console.log('Запросить КП для товара:', product.id);
    alert(`Запрос коммерческого предложения для: ${product.name}`);
  };

  const handleContactSeller = (product: Product) => {
    console.log('Связаться с продавцом товара:', product.id);
    alert(`Связь с продавцом для товара: ${product.name}`);
  };

  const handleToggleFavorite = (product: import('../models').Product) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(product.id)) {
        newSet.delete(product.id);
      } else {
        newSet.add(product.id);
      }
      return newSet;
    });
  };

  const handleToggleCompare = (product: import('../models').Product) => {
    setCompareList(prev => {
      const newSet = new Set(prev);
      if (newSet.has(product.id)) {
        newSet.delete(product.id);
      } else {
        newSet.add(product.id);
      }
      return newSet;
    });
  };

  return (
    <div className="main-content">
      <RelatedProducts
        products={searchState.products}
        currentProducts={searchState.filteredProducts}
        searchQuery={searchState.searchQuery}
        onProductClick={handleCardClick}
      />
      <main className="shop-main">
        <div className="shop-header">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="mobile-sidebar-toggle"
            style={{ display: 'none' }}
          />
          <h1 className="shop-title">
            {ShopPresenter.getCategoryTitle(selectedCategory, selectedSubcategory, categories.categories)}
          </h1>
          <span className="products-count">
            Найдено: {searchState.filteredProducts.length} из {searchState.products.length} товаров
            {import.meta.env.DEV && (
              <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem' }}>
                (всего: {searchState.products.length}, отфильтровано: {searchState.filteredProducts.length})
              </span>
            )}
          </span>
        </div>

        {hasProducts ? (
          <>
            {searchState.isLoading && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  background: '#f4f6f8',
                  color: '#4b5563',
                  fontSize: '0.95rem'
                }}
              >
                Обновляем каталог в фоне. Карточки уже доступны для просмотра.
              </div>
            )}
            <div className="products-grid">
              {searchState.filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onCardClick={handleCardClick}
                  onRequestQuote={handleRequestQuote}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleCompare={handleToggleCompare}
                  onLoginRequired={onLoginRequired}
                  isFavorite={favorites.has(product.id)}
                  isInCompare={compareList.has(product.id)}
                />
              ))}
            </div>
          </>
        ) : searchState.isLoading ? (
          <div className="empty-state">
            <p className="empty-message">Загружаем каталог...</p>
          </div>
        ) : searchState.error ? (
          <div className="empty-state">
            <p className="empty-message">{searchState.error}</p>
            <button 
              onClick={() => dispatch(searchProducts({}))}
              className="reset-filters-button"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-message">Товары не найдены</p>
            {import.meta.env.DEV && (
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                <p>Отладка:</p>
                <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                  <li>Всего товаров в store: {searchState.products.length}</li>
                  <li>Отфильтровано: {searchState.filteredProducts.length}</li>
                  <li>Активные фильтры: {JSON.stringify(searchState.filters)}</li>
                  <li>Поисковый запрос: "{searchState.searchQuery}"</li>
                  <li>Загрузка: {searchState.isLoading ? 'да' : 'нет'}</li>
                  <li>Ошибка: {searchState.error || 'нет'}</li>
                </ul>
              </div>
            )}
            <button 
              onClick={() => dispatch(resetFilters())}
              className="reset-filters-button"
            >
              Сбросить фильтры
            </button>
            <button 
              onClick={() => dispatch(searchProducts({}))}
              className="reset-filters-button"
              style={{ marginLeft: '0.5rem' }}
            >
              Перезагрузить товары
            </button>
          </div>
        )}
      </main>
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={(product) => {
          console.log('Добавить в корзину:', product.id);
        }}
        onRequestQuote={(product) => {
          handleRequestQuote(product);
        }}
        onContactSeller={(product) => {
          handleContactSeller(product);
        }}
      />
    </div>
  );
};
