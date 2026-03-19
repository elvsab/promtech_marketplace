import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductGroup, User } from '../models';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Package, 
  MoreVertical,
  X,
  Check
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loadGroupsForSeller,
  addGroup,
  updateGroup,
  deleteGroup,
  selectGroup,
  addProductToGroup,
  removeProductFromGroup,
  initializeWithRootGroup,
} from '../store';
import '../styles/components/ProductGroupsPage.scss';

interface ProductGroupsPageProps {
  user: User;
  products: Product[];
}

export const ProductGroupsPage: React.FC<ProductGroupsPageProps> = ({ user, products }) => {
  const dispatch = useAppDispatch();
  const { groups, selectedGroupId } = useAppSelector((state) => state.productGroups);
  
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  useEffect(() => {
    dispatch(initializeWithRootGroup(user.id));
    dispatch(loadGroupsForSeller(user.id));
  }, [dispatch, user.id]);

  const filteredGroups = useMemo(() => {
    const sellerGroups = groups.filter(g => g.sellerId === user.id);
    if (!groupSearchQuery.trim()) {
      return sellerGroups;
    }
    const query = groupSearchQuery.toLowerCase();
    return sellerGroups.filter(g => 
      g.name.toLowerCase().includes(query) ||
      (g.description && g.description.toLowerCase().includes(query))
    );
  }, [groups, user.id, groupSearchQuery]);

  const selectedGroup = useMemo(() => {
    return groups.find(g => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  const groupProducts = useMemo(() => {
    if (!selectedGroup) {
      return products;
    }
    return products.filter(p => selectedGroup.productIds.includes(p.id));
  }, [products, selectedGroup]);

  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) {
      return groupProducts;
    }
    const query = productSearchQuery.toLowerCase();
    return groupProducts.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.article && p.article.toLowerCase().includes(query))
    );
  }, [groupProducts, productSearchQuery]);

  const getGroupStats = (group: ProductGroup) => {
    const groupProducts = products.filter(p => group.productIds.includes(p.id));
    return {
      total: groupProducts.length,
      published: groupProducts.length,
      hidden: 0,
      deleted: 0,
    };
  };

  const handleSelectGroup = (groupId: string | null) => {
    dispatch(selectGroup(groupId));
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    
    dispatch(addGroup({
      name: newGroupName.trim(),
      description: newGroupDescription.trim() || undefined,
      sellerId: user.id,
      imageUrl: undefined,
    }));
    
    setNewGroupName('');
    setNewGroupDescription('');
    setIsAddGroupModalOpen(false);
  };

  const handleEditGroup = (group: ProductGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || '');
    setIsAddGroupModalOpen(true);
  };

  const handleUpdateGroup = () => {
    if (!editingGroup || !newGroupName.trim()) return;
    
    dispatch(updateGroup({
      id: editingGroup.id,
      updates: {
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined,
      },
    }));
    
    setEditingGroup(null);
    setNewGroupName('');
    setNewGroupDescription('');
    setIsAddGroupModalOpen(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту группу? Товары не будут удалены, но будут исключены из группы.')) {
      dispatch(deleteGroup(groupId));
    }
  };

  const handleAddProductToGroup = (productId: string, groupId: string) => {
    dispatch(addProductToGroup({ groupId, productId }));
  };

  const handleRemoveProductFromGroup = (productId: string, groupId: string) => {
    dispatch(removeProductFromGroup({ groupId, productId }));
  };

  const handleToggleProductInGroup = (productId: string) => {
    if (!selectedGroup) return;
    
    if (selectedGroup.productIds.includes(productId)) {
      handleRemoveProductFromGroup(productId, selectedGroup.id);
    } else {
      handleAddProductToGroup(productId, selectedGroup.id);
    }
  };

  const getGroupImage = (group: ProductGroup) => {
    if (group.id === 'root') {
      return null;
    }
    if (group.imageUrl) {
      return group.imageUrl;
    }
    const firstProduct = products.find(p => group.productIds.includes(p.id));
    return firstProduct?.imageUrl || null;
  };

  return (
    <div className="product-groups-page">
      <div className="groups-header">
        <div className="header-title">
          <Package size={24} />
          <h1>Управление группами и подборками</h1>
        </div>
        <div className="header-actions">
          <button className="export-button">
            Экспорт
          </button>
          <button className="add-selection-button">
            <Plus size={16} />
            Добавить подборку
          </button>
          <button 
            className="add-group-button"
            onClick={() => {
              setEditingGroup(null);
              setNewGroupName('');
              setNewGroupDescription('');
              setIsAddGroupModalOpen(true);
            }}
          >
            <Plus size={16} />
            Добавить группу
          </button>
        </div>
      </div>

      <div className="groups-layout">
        <div className="groups-panel">
          <div className="panel-header">
            <h2>Группы</h2>
          </div>
          
          <div className="groups-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Поиск по группам"
              value={groupSearchQuery}
              onChange={(e) => setGroupSearchQuery(e.target.value)}
            />
          </div>

          <div className="groups-stats">
            <div className="stat-label">Название группы</div>
            <div className="stat-label">Позиции</div>
          </div>

          <div className="groups-list">
            {filteredGroups.map((group) => {
              const stats = getGroupStats(group);
              const groupImage = getGroupImage(group);
              const isRootGroup = group.id === 'root';
              
              return (
                <div
                  key={group.id}
                  className={`group-item ${selectedGroupId === group.id ? 'active' : ''} ${isRootGroup ? 'root-group' : ''}`}
                  onClick={() => handleSelectGroup(group.id)}
                >
                  <div className="group-checkbox">
                    <input type="checkbox" readOnly checked={selectedGroupId === group.id} />
                  </div>
                  {groupImage && (
                    <div className="group-image">
                      <img src={groupImage} alt={group.name} />
                    </div>
                  )}
                  {!groupImage && !isRootGroup && (
                    <div className="group-image-placeholder">
                      <Package size={24} />
                    </div>
                  )}
                  <div className="group-content">
                    <div className="group-name">{group.name}</div>
                    <div className="group-stats">
                      <div>Всего позиций: {stats.total}</div>
                      <div>Опубликованные: {stats.published}/0</div>
                      <div>Скрытые/Удаленные: {stats.hidden}/{stats.deleted}</div>
                    </div>
                  </div>
                  <div className="group-actions">
                    {!isRootGroup && (
                      <button 
                        className="actions-button"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="products-panel">
          <div className="panel-header">
            <h2>Позиции</h2>
          </div>

          <div className="products-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Поиск по товарам"
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
            />
          </div>

          <div className="products-list">
            {filteredProducts.map((product) => {
              const isInSelectedGroup = selectedGroup 
                ? selectedGroup.productIds.includes(product.id)
                : false;
              
              return (
                <div key={product.id} className="product-item">
                  <div className="product-drag-handle">
                    <div className="drag-dots">⋮⋮</div>
                  </div>
                  <div className="product-image">
                    <img src={product.imageUrl} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-status">
                      {product.price > 0 ? 'В наличии' : 'Под заказ'}
                    </div>
                    {product.price > 0 && (
                      <div className="product-price">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </div>
                    )}
                  </div>
                  <div className="product-actions">
                    {selectedGroup && (
                      <button
                        className={`add-to-group-button ${isInSelectedGroup ? 'in-group' : ''}`}
                        onClick={() => handleToggleProductInGroup(product.id)}
                        title={isInSelectedGroup ? 'Удалить из группы' : 'Добавить в группу'}
                      >
                        {isInSelectedGroup ? <Check size={16} /> : <Plus size={16} />}
                      </button>
                    )}
                    <button className="delete-button" title="Удалить">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredProducts.length === 0 && (
              <div className="empty-state">
                <Package size={48} />
                <p>Товары не найдены</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAddGroupModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddGroupModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGroup ? 'Редактировать группу' : 'Добавить группу'}</h2>
              <button 
                className="close-button"
                onClick={() => setIsAddGroupModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Название группы *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Введите название группы"
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Введите описание группы (необязательно)"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setIsAddGroupModalOpen(false)}
              >
                Отмена
              </button>
              <button
                className="save-button"
                onClick={editingGroup ? handleUpdateGroup : handleAddGroup}
                disabled={!newGroupName.trim()}
              >
                {editingGroup ? 'Сохранить изменения' : 'Создать группу'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
