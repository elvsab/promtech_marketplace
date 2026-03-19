import React, { useState, useEffect } from 'react';
import { X, Package, Plus, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { Category, ProductStatus, ProductAvailability, ProductGroup } from '../models';
import '../styles/components/AddProductModal.scss';

export interface ProductFormData {
  name: string;
  description: string;
  article: string;
  category: string;
  subcategory?: string;
  specs: Array<{ key: string; value: string }>;
  status?: ProductStatus;
  price?: number;
  availability?: ProductAvailability;
  stock?: number;
  daysToDelivery?: number;
  imageUrls?: string[];
  groupId?: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: ProductFormData;
  isEdit?: boolean;
  categories?: Category[];
  productGroups?: ProductGroup[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  categories = [],
  productGroups = [],
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [article, setArticle] = useState(initialData?.article || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || '');
  const [groupId, setGroupId] = useState(initialData?.groupId || '');
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(
    initialData?.specs.length 
      ? initialData.specs 
      : [{ key: '', value: '' }]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем подкатегории для выбранной категории
  const selectedCategoryData = categories.find(cat => cat.id === category);
  const availableSubcategories = selectedCategoryData?.subcategories || [];

  // Обновляем форму при изменении initialData или открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setArticle(initialData?.article || '');
      setCategory(initialData?.category || '');
      setSubcategory(initialData?.subcategory || '');
      setGroupId(initialData?.groupId || '');
      setSpecs(
        initialData?.specs.length 
          ? initialData.specs 
          : [{ key: '', value: '' }]
      );
      setError(null);
    }
  }, [isOpen, initialData]);

  // Сбрасываем подкатегорию при изменении категории
  useEffect(() => {
    if (category && !isEdit) {
      setSubcategory('');
    }
  }, [category, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валидация
    if (!name.trim()) {
      setError('Название товара обязательно');
      return;
    }
    if (!description.trim()) {
      setError('Описание товара обязательно');
      return;
    }
    if (!article.trim()) {
      setError('Артикул товара обязателен');
      return;
    }
    if (!category.trim()) {
      setError('Категория товара обязательна');
      return;
    }

    // Фильтруем пустые спецификации
    const validSpecs = specs.filter(spec => spec.key.trim() && spec.value.trim());

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        article: article.trim(),
        category: category.trim(),
        subcategory: subcategory.trim() || undefined,
        groupId: groupId || undefined,
        specs: validSpecs,
      });
      // Сброс формы
      setName('');
      setDescription('');
      setArticle('');
      setCategory('');
      setSubcategory('');
      setGroupId('');
      setSpecs([{ key: '', value: '' }]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении товара');
    } finally {
      setIsLoading(false);
    }
  };

  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    if (specs.length > 1) {
      setSpecs(specs.filter((_, i) => i !== index));
    }
  };

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specs];
    updated[index] = { ...updated[index], [field]: value };
    setSpecs(updated);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
      showCloseButton={false}
    >
      <div className="add-product-modal">
        <button 
          onClick={onClose}
          className="modal-close-button"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="modal-header-section">
          <div className="modal-icon-wrapper">
            <Package size={24} />
          </div>
          <h2 className="modal-title">
            {isEdit ? 'Редактировать товар' : 'Добавить новый товар'}
          </h2>
          <p className="modal-subtitle">
            {isEdit ? 'Обновите информацию о товаре' : 'Заполните форму для добавления товара в каталог'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="product-form">
          {/* Название */}
          <div className="form-group">
            <label htmlFor="product-name" className="form-label">
              Название товара *
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: ТВЧ для нагрева стали"
              required
              disabled={isLoading}
              className="form-input"
            />
          </div>

          {/* Описание */}
          <div className="form-group">
            <label htmlFor="product-description" className="form-label">
              Описание *
            </label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробное описание товара, его характеристик и назначения"
              required
              disabled={isLoading}
              rows={4}
              className="form-textarea"
            />
          </div>

          {/* Артикул */}
          <div className="form-group">
            <label htmlFor="product-article" className="form-label">
              Артикул *
            </label>
            <input
              id="product-article"
              type="text"
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              placeholder="Например: ART-12345"
              required
              disabled={isLoading}
              className="form-input"
            />
          </div>

          {/* Категория */}
          <div className="form-group">
            <label htmlFor="product-category" className="form-label">
              Категория *
            </label>
            <select
              id="product-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory(''); // Сбрасываем подкатегорию при смене категории
              }}
              required
              disabled={isLoading}
              className="form-select"
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Подкатегория */}
          {availableSubcategories.length > 0 && (
            <div className="form-group">
              <label htmlFor="product-subcategory" className="form-label">
                Подкатегория
              </label>
              <select
                id="product-subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                disabled={isLoading || !category}
                className="form-select"
              >
                <option value="">Выберите подкатегорию (необязательно)</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Группа товаров */}
          {isEdit && (
            <div className="form-group">
              <label htmlFor="product-group" className="form-label">
                Группа товаров
              </label>
              <select
                id="product-group"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                disabled={isLoading}
                className="form-select"
              >
                <option value="">Без группы</option>
                {productGroups && productGroups.length > 0 ? (
                  productGroups
                    .filter(group => group.id !== 'root') // Исключаем корневую группу
                    .map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))
                ) : (
                  <option value="" disabled>Создайте группу в разделе "Группы и подборки"</option>
                )}
              </select>
              <p className="form-hint">
                Выберите группу, к которой будет относиться этот товар
              </p>
            </div>
          )}

          {/* Характеристики */}
          <div className="form-group">
            <div className="specs-header">
              <label className="form-label">Характеристики</label>
              <button
                type="button"
                onClick={addSpec}
                className="add-spec-button"
                disabled={isLoading}
              >
                <Plus size={16} />
                Добавить характеристику
              </button>
            </div>
            
            <div className="specs-list">
              {specs.map((spec, index) => (
                <div key={index} className="spec-row">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => updateSpec(index, 'key', e.target.value)}
                    placeholder="Название (например: Мощность)"
                    disabled={isLoading}
                    className="spec-key-input"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpec(index, 'value', e.target.value)}
                    placeholder="Значение (например: 20кВт)"
                    disabled={isLoading}
                    className="spec-value-input"
                  />
                  {specs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpec(index)}
                      className="remove-spec-button"
                      disabled={isLoading}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="spinner" size={18} />
                  Сохранение...
                </>
              ) : (
                <>
                  {isEdit ? 'Сохранить изменения' : 'Добавить товар'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

