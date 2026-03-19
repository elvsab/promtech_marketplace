import React, { useState } from 'react';
import { User } from '../models';
import { ShoppingCart, MessageSquare, Search, Filter, Download } from 'lucide-react';
import '../styles/components/OrdersPage.scss';

interface OrdersPageProps {
  user: User;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'messages'>('orders');

  return (
    <div className="orders-page">
      <div className="page-header">
        <div className="header-title">
          <h1>Заказы и сообщения</h1>
        </div>
        <div className="header-actions">
          <button className="export-button">
            <Download size={16} />
            Экспорт
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingCart size={16} />
          Заказы
        </button>
        <button
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <MessageSquare size={16} />
          Сообщения
        </button>
      </div>

      <div className="content-area">
        {activeTab === 'orders' ? (
          <div className="orders-content">
            <div className="filters-bar">
              <div className="search-filter">
                <Search size={16} />
                <input type="text" placeholder="Поиск по заказам..." />
              </div>
              <div className="status-filters">
                <select>
                  <option value="all">Все статусы</option>
                  <option value="new">Новые</option>
                  <option value="processing">В обработке</option>
                  <option value="completed">Завершенные</option>
                  <option value="cancelled">Отмененные</option>
                </select>
              </div>
            </div>

            <div className="orders-list">
              <div className="empty-state">
                <ShoppingCart size={48} />
                <p>Заказы отсутствуют</p>
                <span>Когда появятся заказы, они будут отображаться здесь</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-content">
            <div className="filters-bar">
              <div className="search-filter">
                <Search size={16} />
                <input type="text" placeholder="Поиск по сообщениям..." />
              </div>
            </div>

            <div className="messages-list">
              <div className="empty-state">
                <MessageSquare size={48} />
                <p>Сообщения отсутствуют</p>
                <span>Когда появятся сообщения, они будут отображаться здесь</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

