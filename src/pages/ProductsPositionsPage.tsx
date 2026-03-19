import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, User, ProductStatus, ProductAvailability, ProductFormData } from '../models';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  EyeOff,
  FileText,
  MoreVertical,
  Download,
  CheckSquare,
  Square,
  Layers,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { deleteSellerProduct, loadGroupsForSeller, moveProductToGroup, initializeWithRootGroup } from '../store';
import { AddProductModal } from '../views';
import '../styles/components/ProductsPositionsPage.scss';

interface ProductsPositionsPageProps {
  user: User;
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (id: string, product: Partial<Product>) => Promise<void>;
  onAdd: (product: Omit<Product, 'id'>) => Promise<void>;
}

type SortField = 'name' | 'date' | 'code' | 'price' | 'orders';
type SortDirection = 'asc' | 'desc';

export const ProductsPositionsPage: React.FC<ProductsPositionsPageProps> = ({
  user,
  products,
  onDelete,
  onEdit,
  onAdd,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { groups } = useAppSelector((state) => state.productGroups);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<ProductAvailability | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState<string | null>(null);

  // Инициализация групп при загрузке
  useEffect(() => {
    dispatch(initializeWithRootGroup(user.id));
    dispatch(loadGroupsForSeller(user.id));
  }, [dispatch, user.id]);

  // Закрытие меню действий при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuOpen && !(event.target as Element).closest('.actions-menu-wrapper')) {
        setActionsMenuOpen(null);
      }
    };

    if (actionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionsMenuOpen]);

  // Фильтрация и сортировка
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (p.article && p.article.toLowerCase().includes(query))
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Фильтр по наличию
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter((p) => p.availability === availabilityFilter);
    }

    // Сортировка
    filtered = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.updatedAt || a.createdAt || 0).getTime();
          bValue = new Date(b.updatedAt || b.createdAt || 0).getTime();
          break;
        case 'code':
          aValue = a.article || '';
          bValue = b.article || '';
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'orders':
          aValue = a.ordersCount || 0;
          bValue = b.ordersCount || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchQuery, statusFilter, availabilityFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleAllSelection = () => {
    if (selectedProducts.size === filteredAndSortedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredAndSortedProducts.map((p) => p.id)));
    }
  };

  const handleAddToGroup = () => {
    if (selectedProducts.size === 0) return;
    
    alert(`Выбрано позиций для группировки: ${selectedProducts.size}`);
  };

  const isAllSelected = filteredAndSortedProducts.length > 0 && selectedProducts.size === filteredAndSortedProducts.length;

  const getStatusLabel = (status?: ProductStatus) => {
    switch (status) {
      case 'published':
        return 'Опубликован';
      case 'draft':
        return 'Черновик';
      case 'hidden':
        return 'Скрытый';
      default:
        return 'Черновик';
    }
  };

  const getStatusIcon = (status?: ProductStatus) => {
    switch (status) {
      case 'published':
        return <Eye size={14} />;
      case 'hidden':
        return <EyeOff size={14} />;
      case 'draft':
        return <FileText size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const getAvailabilityLabel = (availability?: ProductAvailability) => {
    switch (availability) {
      case 'in_stock':
        return 'В наличии';
      case 'on_order':
        return 'Под заказ';
      case 'out_of_stock':
        return 'Нет в наличии';
      default:
        return 'Под заказ';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
    setActionsMenuOpen(null);
  };

  const handleEditSubmit = async (data: ProductFormData) => {
    if (!editingProduct) return;

    // Получаем старую группу товара
    const oldGroupId = editingProduct.groupId || null;
    const newGroupId = data.groupId || null;

    // Обновляем товар
    await onEdit(editingProduct.id, {
      name: data.name,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      article: data.article,
      groupId: newGroupId || undefined,
      specs: data.specs.reduce((acc, spec) => {
        if (spec.key.trim() && spec.value.trim()) {
          acc[spec.key.trim()] = spec.value.trim();
        }
        return acc;
      }, {} as Record<string, string>),
    });

    // Синхронизируем с группами в Redux
    if (oldGroupId !== newGroupId) {
      dispatch(moveProductToGroup({
        productId: editingProduct.id,
        fromGroupId: oldGroupId,
        toGroupId: newGroupId,
      }));
    }

    setEditingProduct(null);
    setIsEditModalOpen(false);
  };

  const getInitialFormData = (product: Product): ProductFormData => {
    const specsArray = Object.entries(product.specs || {}).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    return {
      name: product.name,
      description: product.description,
      article: product.article || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      groupId: product.groupId || '',
      specs: specsArray.length > 0 ? specsArray : [{ key: '', value: '' }],
    };
  };

  const sellerGroups = useMemo(() => {
    return groups.filter(g => g.sellerId === user.id);
  }, [groups, user.id]);

  return (
    <div className="products-positions-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-title">
          <h1>Список позиций</h1>
        </div>
        <div className="header-actions">
          <button className="export-button">
            <Download size={16} />
            Экспорт
          </button>
          {selectedProducts.size > 0 && (
            <button 
              className="add-to-group-button"
              onClick={handleAddToGroup}
            >
              <Layers size={18} />
              Добавить в группу ({selectedProducts.size})
            </button>
          )}
          <button className="add-product-button" onClick={() => navigate('/dashboard/products/new')}>
            <Plus size={18} />
            Добавить товар
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-filter">
          <Search size={16} />
          <input
            type="text"
            placeholder="Поиск по названию, описанию, артикулу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="status-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProductStatus | 'all')}
          >
            <option value="all">Все статусы</option>
            <option value="published">Опубликованные</option>
            <option value="draft">Черновики</option>
            <option value="hidden">Скрытые</option>
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as ProductAvailability | 'all')}
          >
            <option value="all">Все</option>
            <option value="in_stock">В наличии</option>
            <option value="on_order">Под заказ</option>
            <option value="out_of_stock">Нет в наличии</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <button 
                  className="checkbox-icon-button"
                  onClick={toggleAllSelection}
                  title={isAllSelected ? "Снять выделение" : "Выделить всё"}
                >
                  {isAllSelected ? (
                    <CheckSquare size={20} className="checkbox-icon checked" />
                  ) : (
                    <Square size={20} className="checkbox-icon" />
                  )}
                </button>
              </th>
              <th className="name-col">
                <button className="sort-button" onClick={() => handleSort('name')}>
                  Название
                  {sortField === 'name' && <ArrowUpDown size={14} />}
                </button>
              </th>
              <th className="date-col">
                <button className="sort-button" onClick={() => handleSort('date')}>
                  Дата
                  {sortField === 'date' && <ArrowUpDown size={14} />}
                </button>
              </th>
              <th className="code-col">
                <button className="sort-button" onClick={() => handleSort('code')}>
                  Код
                  {sortField === 'code' && <ArrowUpDown size={14} />}
                </button>
              </th>
              <th className="display-col">Отображение</th>
              <th className="price-col">
                <button className="sort-button" onClick={() => handleSort('price')}>
                  Цена
                  {sortField === 'price' && <ArrowUpDown size={14} />}
                </button>
              </th>
              <th className="orders-col">
                <button className="sort-button" onClick={() => handleSort('orders')}>
                  Заказы
                  {sortField === 'orders' && <ArrowUpDown size={14} />}
                </button>
              </th>
              <th className="actions-col">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.map((product) => {
              const isSelected = selectedProducts.has(product.id);
              return (
                <tr key={product.id} className={isSelected ? 'selected' : ''}>
                  <td className="checkbox-col">
                    <button 
                      className="checkbox-icon-button"
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      {isSelected ? (
                        <CheckSquare size={20} className="checkbox-icon checked" />
                      ) : (
                        <Square size={20} className="checkbox-icon" />
                      )}
                    </button>
                  </td>
                  <td className="name-col">
                    <div className="product-name-cell">
                      <img src={product.imageUrl} alt={product.name} className="product-thumb" />
                      <div className="product-info">
                        <div className="product-title">{product.name}</div>
                        <div className="product-description">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="date-col">{formatDate(product.updatedAt || product.createdAt)}</td>
                  <td className="code-col">
                    {product.article ? (
                      <span className="product-code">{product.article}</span>
                    ) : (
                      <button className="add-code-button">Добавить</button>
                    )}
                  </td>
                  <td className="display-col">
                    <div className="display-info">
                      <div className="status-badge status-published">
                        {getStatusIcon(product.status)}
                        {getStatusLabel(product.status)}
                      </div>
                      <div className="availability-info">
                        {getAvailabilityLabel(product.availability)}
                        {product.availability === 'on_order' && product.daysToDelivery && (
                          <span className="days-info">{product.daysToDelivery} дней</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="price-col">
                    {product.price > 0 ? (
                      <div className="price-info">
                        <span className="price-value">
                          {product.price.toLocaleString('ru-RU')} ₽
                        </span>
                        <span className="price-type">Розница</span>
                      </div>
                    ) : (
                      <button className="set-price-button">Укажите цену</button>
                    )}
                  </td>
                  <td className="orders-col">{product.ordersCount || 0}</td>
                  <td className="actions-col">
                    <div className="actions-menu-wrapper">
                      <button 
                        className="actions-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionsMenuOpen(actionsMenuOpen === product.id ? null : product.id);
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {actionsMenuOpen === product.id && (
                        <div className="actions-menu">
                          <button
                            className="menu-item"
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit size={14} />
                            Изменить
                          </button>
                          <button
                            className="menu-item danger"
                            onClick={() => {
                              if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
                                onDelete(product.id);
                              }
                              setActionsMenuOpen(null);
                            }}
                          >
                            <Trash2 size={14} />
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredAndSortedProducts.length === 0 && (
              <tr>
                <td colSpan={9} className="empty-state">
                  <div>
                    <p>Товары не найдены</p>
                    <button className="add-first-product" onClick={() => navigate('/dashboard/products/new')}>
                      <Plus size={16} />
                      Добавить первый товар
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <AddProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleEditSubmit}
          initialData={getInitialFormData(editingProduct)}
          isEdit={true}
          productGroups={sellerGroups}
        />
      )}
    </div>
  );
};
