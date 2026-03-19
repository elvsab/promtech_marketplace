// Статус товара
export type ProductStatus = 'published' | 'draft' | 'hidden';

// Наличие товара
export type ProductAvailability = 'in_stock' | 'on_order' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string; // Подкатегория товара
  price: number;
  imageUrl: string;
  imageUrls?: string[]; // Множественные изображения
  specs: Record<string, string>;
  article?: string; // Артикул товара
  model?: string; // Модель товара (для отображения моноширинным шрифтом)
  groupId?: string; // ID группы товаров, к которой принадлежит товар
  status?: ProductStatus; // Статус товара (опубликован/черновик/скрытый)
  availability?: ProductAvailability; // Наличие товара
  stock?: number; // Количество на складе
  daysToDelivery?: number; // Дней до доставки (для товаров под заказ)
  createdAt?: string; // Дата создания
  updatedAt?: string; // Дата обновления
  ordersCount?: number; // Количество заказов
}

// API Product structure (соответствует реальному API)
export interface ApiProduct {
  id: number;
  title: string;
  description: string;
  specs: Record<string, string>;
  owner_id?: number;
  company_name?: string;
}

// Product creation/update payload для API
export interface ProductCreatePayload {
  title: string;
  description: string;
  specs: Record<string, string>;
}

export interface ProductUpdatePayload {
  title?: string;
  description?: string;
  specs?: Record<string, string>;
}

// API Response для обновления продукта
export interface ProductUpdateResponse {
  status: string;
  product: ApiProduct;
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  company_name?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ViewType = 'shop' | 'design-system' | 'dashboard';

// Группа товаров (для организации каталога)
export interface ProductGroup {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string; // Изображение группы (берется из первого товара или загружается отдельно)
  sellerId: string; // ID продавца, которому принадлежит группа
  createdAt: string; // Дата создания
  updatedAt: string; // Дата обновления
  productIds: string[]; // Массив ID товаров, входящих в группу
}
