import React, { useState } from 'react';
import { Product } from '../models';
import { Heart, GitCompare } from 'lucide-react';
import { useAuth } from '../hooks';
import '../styles/components/ProductCard.scss';

interface ProductCardProps {
  product: Product;
  onCardClick?: (product: Product) => void;
  onRequestQuote?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  onLoginRequired?: () => void;
  isFavorite?: boolean;
  isInCompare?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onCardClick,
  onRequestQuote,
  onToggleFavorite,
  onToggleCompare,
  onLoginRequired,
  isFavorite = false,
  isInCompare = false
}) => {
  const { isLoggedIn } = useAuth();
  const [showTooltip, setShowTooltip] = useState<{ favorite: boolean; compare: boolean }>({
    favorite: false,
    compare: false
  });

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.action-icon') || target.closest('.request-quote-button')) {
      return;
    }
    onCardClick?.(product);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    onToggleFavorite?.(product);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    onToggleCompare?.(product);
  };

  const handleRequestQuoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestQuote?.(product);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="action-icons">
        <button
          className={`action-icon favorite-icon ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          onMouseEnter={() => setShowTooltip({ ...showTooltip, favorite: true })}
          onMouseLeave={() => setShowTooltip({ ...showTooltip, favorite: false })}
          aria-label="Добавить в избранное"
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          {showTooltip.favorite && (
            <span className="tooltip">Добавить в избранное</span>
          )}
        </button>
        
        <button
          className={`action-icon compare-icon ${isInCompare ? 'active' : ''}`}
          onClick={handleCompareClick}
          onMouseEnter={() => setShowTooltip({ ...showTooltip, compare: true })}
          onMouseLeave={() => setShowTooltip({ ...showTooltip, compare: false })}
          aria-label="Добавить к сравнению"
        >
          <GitCompare size={20} />
          {showTooltip.compare && (
            <span className="tooltip">Добавить к сравнению</span>
          )}
        </button>
      </div>

      <div className="image-container">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="product-image"
        />
        <div className="status-badge">
          В наличии
        </div>
      </div>

      <div className="content">
        <div className="category-label">
          {product.category}
        </div>
        <h3 className="product-title">
          {product.name}
        </h3>
        {product.model && (
          <div className="product-model">
            {product.model}
          </div>
        )}
        
        <p className="product-description">
          {product.description}
        </p>

        <div className="specs-container">
          {Object.entries(product.specs).map(([key, val]) => (
            <div key={key} className="spec-row">
              <span className="spec-key">{key}:</span>
              <span className="spec-value">{val}</span>
            </div>
          ))}
        </div>
        
        <button className="request-quote-button" onClick={handleRequestQuoteClick}>
          Запросить КП
        </button>
      </div>
    </div>
  );
};
