import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Truck, ChevronRight, Package, Star, MessageCircle } from 'lucide-react';
import { Product } from '../models';
import '../styles/components/ProductModal.scss';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onRequestQuote?: (product: Product) => void;
  onContactSeller?: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ 
  product, 
  isOpen, 
  onClose,
  onAddToCart,
  onRequestQuote,
  onContactSeller
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
    }
  }, [product]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const gallery = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : [
        product.imageUrl,
        `https://picsum.photos/800/600?random=${product.id}1`,
        `https://picsum.photos/800/600?random=${product.id}2`,
      ];

  const handleAddToCart = () => {
    onAddToCart?.(product);
  };

  const handleRequestQuote = () => {
    onRequestQuote?.(product);
  };

  const handleContactSeller = () => {
    onContactSeller?.(product);
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="product-modal-close"
          aria-label="Закрыть"
        >
          <X size={24} />
        </button>

        <div className="product-modal-gallery">
          <div className="product-modal-main-image">
            <img 
              src={gallery[activeImageIndex]} 
              alt={product.name} 
              className="product-modal-image"
            />
            <div className="product-modal-badge">
              <span className="badge-text">Premium Quality</span>
            </div>
          </div>

          <div className="product-modal-thumbnails">
            {gallery.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`thumbnail-button ${activeImageIndex === idx ? 'active' : ''}`}
                aria-label={`Показать изображение ${idx + 1}`}
              >
                <img src={img} className="thumbnail-image" alt={`view-${idx}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-modal-info">
          <div className="product-modal-header">
            <div className="product-meta">
              <Package size={14} />
              <span className="meta-text">Арт. PT-{product.id}0001</span>
              <span className="meta-separator">|</span>
              <span className="meta-text">{product.category}</span>
            </div>
            <h1 className="product-modal-title">
              {product.name}
            </h1>
          </div>

          <div className="product-modal-contact-section">
            <div className="contact-header">
              <div className="availability-info">
                <span className="availability-badge">В наличии на складе</span>
                <p className="availability-update">Обновлено сегодня, 10:45</p>
              </div>
            </div>

            <div className="product-modal-actions">
              <button 
                className="action-button contact-seller-button"
                onClick={handleContactSeller}
              >
                <MessageCircle size={20} />
                Связаться с продавцом
              </button>
              <button 
                className="action-button request-quote-button"
                onClick={handleRequestQuote}
              >
                Запросить КП
              </button>
            </div>
          </div>

          <div className="product-modal-content">
            <section className="content-section">
              <h3 className="section-title">
                <div className="title-accent"></div>
                Описание
              </h3>
              <p className="section-text">
                {product.description} Это современное решение для индустриальных задач любого масштаба. 
                Продукт сочетает в себе высокую производительность, энергоэффективность и долговечность. 
                Разработан с учетом жестких условий эксплуатации на российских предприятиях.
              </p>
            </section>

            <section className="content-section">
              <h3 className="section-title">
                <div className="title-accent"></div>
                Характеристики
              </h3>
              <div className="specs-grid">
                {Object.entries(product.specs).map(([key, value], idx) => (
                  <div 
                    key={key} 
                    className={`spec-item ${idx % 2 === 0 ? 'even' : 'odd'}`}
                  >
                    <span className="spec-key">{key}</span>
                    <span className="spec-value">{String(value)}</span>
                  </div>
                ))}
                <div className="spec-item even">
                  <span className="spec-key">Страна производства</span>
                  <span className="spec-value">Германия / Россия</span>
                </div>
                <div className="spec-item odd">
                  <span className="spec-key">Срок поставки</span>
                  <span className="spec-value">3-5 рабочих дней</span>
                </div>
              </div>
            </section>

            <div className="download-section">
              <button className="download-button">
                <div className="download-content">
                  <FileText className="download-icon" size={24} />
                  <div className="download-text">
                    <p className="download-title">Скачать техпаспорт</p>
                    <p className="download-subtitle">PDF, 4.2 MB</p>
                  </div>
                </div>
                <ChevronRight className="download-arrow" size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
