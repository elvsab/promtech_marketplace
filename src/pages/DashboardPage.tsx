import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, User, Category } from '../models';
import { Trash2, Edit, Plus, Package, Settings, LogOut, FolderTree } from 'lucide-react';
import { ShopPresenter } from '../presenters';
import { AddProductModal, ProductFormData } from '../views';
import '../styles/components/Dashboard.scss';

// Note: Dashboard is a page, not a view component

interface DashboardProps {
  user: User;
  products: Product[];
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit: (id: string, product: Partial<Product>) => Promise<void>;
  onAdd: (product: Omit<Product, 'id'>) => Promise<void>;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ user, products, categories, onDelete, onEdit, onAdd, onLogout }) => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditClick = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setEditingProduct(product);
      setIsEditModalOpen(true);
    }
  };

  const handleAddSubmit = async (data: ProductFormData) => {
    // Преобразуем массив specs в объект
    const specs: Record<string, string> = {};
    data.specs.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specs[spec.key.trim()] = spec.value.trim();
      }
    });

    try {
      await onAdd({
        name: data.name,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        article: data.article,
        price: 0, // API не поддерживает цену
        imageUrl: '', // Будет сгенерировано автоматически
        specs,
      });
      // Модальное окно закроется автоматически после успешного добавления
    } catch (error) {
      // Ошибка будет обработана в модальном окне
      throw error;
    }
  };

  const handleEditSubmit = async (data: ProductFormData) => {
    if (!editingProduct) return;

    // Преобразуем массив specs в объект
    const specs: Record<string, string> = {};
    data.specs.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specs[spec.key.trim()] = spec.value.trim();
      }
    });

    await onEdit(editingProduct.id, {
      name: data.name,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      article: data.article,
      specs,
    });

    setEditingProduct(null);
    setIsEditModalOpen(false);
  };

  // Преобразуем объект specs в массив для формы
  const specsToArray = (specs: Record<string, string>): Array<{ key: string; value: string }> => {
    const entries = Object.entries(specs);
    if (entries.length === 0) {
      return [{ key: '', value: '' }];
    }
    return entries.map(([key, value]) => ({ key, value }));
  };

  const getInitialFormData = (product: Product | null): ProductFormData | undefined => {
    if (!product) return undefined;
    return {
      name: product.name,
      description: product.description,
      article: product.article || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      specs: specsToArray(product.specs),
    };
  };
  return (
    <div className="dashboard">
       <div className="dashboard-header">
         <div className="user-info">
                <div className="user-avatar">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
            <div className="user-details">
              <h1>{user.name || user.email || 'Пользователь'}</h1>
              <p>{user.email}</p>
            </div>
         </div>
         
         <div className="dashboard-actions">
            <button 
                onClick={() => navigate('/dashboard/groups')}
                className="groups-button"
                title="Управление группами товаров"
            >
                <FolderTree size={16} />
                Группы товаров
            </button>
            <button className="settings-button">
                <Settings size={16} />
                Настройки
            </button>
            <button 
                onClick={onLogout}
                className="logout-button"
            >
                <LogOut size={16} />
                Выйти
            </button>
         </div>
       </div>

       <div className="products-section">
         <div className="products-header">
           <div className="products-header-content">
             <div className="products-header-icon">
                <Package size={20} />
             </div>
             <div className="products-header-text">
                <h2>Мои товары</h2>
                <p>Управление ассортиментом ({products.length})</p>
             </div>
           </div>
           <button 
             onClick={handleAddClick}
             className="add-product-button"
           >
             <Plus size={18} />
             Добавить позицию
           </button>
         </div>

         <div className="products-table-container">
           <table className="products-table">
             <thead>
               <tr>
                 <th>Фото</th>
                 <th>Название / Описание</th>
                 <th>Категория</th>
                 <th>Цена</th>
                 <th style={{ textAlign: 'right' }}>Управление</th>
               </tr>
             </thead>
             <tbody>
               {products.map((product) => (
                 <tr key={product.id}>
                   <td className="product-image-cell">
                     <div className="product-image-wrapper">
                        <img src={product.imageUrl} alt={product.name} />
                     </div>
                   </td>
                   <td className="product-info-cell">
                     <div className="product-name">{product.name}</div>
                     <div className="product-description">{product.description}</div>
                     <div className="product-specs">
                        {Object.entries(product.specs)
                          .filter(([k, v]) => {
                            if (['Артикул', 'article', 'Артикул товара', 'Категория', 'category', 'Подкатегория', 'subcategory'].includes(k)) {
                              return false;
                            }
                            if (typeof v === 'object' && v !== null) {
                              return false;
                            }
                            if (typeof v === 'string' && v.trim() === '') {
                              return false;
                            }
                            return true;
                          })
                          .slice(0, 2)
                          .map(([k, v]) => {
                            let displayValue = '';
                            if (typeof v === 'string') {
                              displayValue = v;
                            } else if (typeof v === 'number' || typeof v === 'boolean') {
                              displayValue = String(v);
                            } else if (v === null || v === undefined) {
                              displayValue = '';
                            } else {
                              displayValue = JSON.stringify(v);
                            }
                            
                            return (
                              <span key={k} className="spec-badge">
                                {k}: {displayValue}
                              </span>
                            );
                          })}
                     </div>
                   </td>
                   <td>
                     <span className="category-badge">
                       {product.category}
                     </span>
                   </td>
                   <td className="price-cell">
                     {ShopPresenter.formatPrice(product.price)}
                   </td>
                   <td className="actions-cell">
                     <div className="actions-buttons">
                       <button 
                         onClick={() => handleEditClick(product.id)}
                         className="edit-button"
                       >
                         <Edit size={14} />
                         Изменить
                       </button>
                       <button 
                         onClick={() => onDelete(product.id)}
                         className="delete-button"
                       >
                         <Trash2 size={14} />
                         Удалить
                       </button>
                     </div>
                   </td>
                 </tr>
               ))}
               {products.length === 0 && (
                 <tr>
                   <td colSpan={5} className="empty-state">
                     <div>
                        <Package size={48} className="empty-icon" />
                        <p className="empty-title">Список товаров пуст</p>
                        <p className="empty-text">Нажмите "Добавить позицию", чтобы создать новый товар.</p>
                     </div>
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
         
         {products.length > 0 && (
            <div className="pagination-footer">
                <span className="pagination-info">Показано {products.length} из {products.length}</span>
                <div className="pagination-buttons">
                    <button className="pagination-button" disabled>Предыдущая</button>
                    <button className="pagination-button" disabled>Следующая</button>
                </div>
            </div>
         )}
       </div>

       <AddProductModal
         isOpen={isAddModalOpen}
         onClose={() => setIsAddModalOpen(false)}
         onSubmit={handleAddSubmit}
         categories={categories}
       />

       <AddProductModal
         isOpen={isEditModalOpen}
         onClose={() => {
           setIsEditModalOpen(false);
           setEditingProduct(null);
         }}
         onSubmit={handleEditSubmit}
         initialData={getInitialFormData(editingProduct)}
         isEdit={true}
         categories={categories}
       />
    </div>
  );
};
