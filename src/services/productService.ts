import { apiService } from './apiService';
import { Product, Category, ApiProduct, ProductCreatePayload, ProductUpdatePayload, ProductUpdateResponse } from '../models';

// Маппинг API продукта в внутренний формат
const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
  const specs = apiProduct.specs || {};
  // Извлекаем артикул из specs, если он там есть
  const article = specs['Артикул'] || specs['article'] || specs['Артикул товара'] || undefined;
  // Извлекаем категорию из specs, если она там есть
  const category = specs['Категория'] || specs['category'] || 'other';
  // Извлекаем подкатегорию из specs, если она там есть
  const subcategory = specs['Подкатегория'] || specs['subcategory'] || undefined;
  // Извлекаем модель из specs, если она там есть
  const model = specs['Модель'] || specs['model'] || specs['Model'] || undefined;
  
  // Удаляем служебные поля из specs и фильтруем только строковые значения
  const cleanSpecs: Record<string, string> = {};
  Object.entries(specs).forEach(([key, value]) => {
    // Пропускаем служебные поля
    if (['Артикул', 'article', 'Артикул товара', 'Категория', 'category', 'Подкатегория', 'subcategory', 'Модель', 'model', 'Model'].includes(key)) {
      return;
    }
    // Преобразуем значение в строку, если это не объект
    if (typeof value === 'string') {
      cleanSpecs[key] = value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      cleanSpecs[key] = String(value);
    } else if (value !== null && value !== undefined) {
      // Если это объект, преобразуем в JSON строку
      cleanSpecs[key] = JSON.stringify(value);
    }
  });
  
  return {
    id: String(apiProduct.id),
    name: apiProduct.title,
    description: apiProduct.description,
    category: category,
    subcategory: subcategory,
    price: 0, // API не возвращает цену
    imageUrl: `https://picsum.photos/400/300?random=${apiProduct.id}`, // Генерируем изображение
    specs: cleanSpecs,
    article: article,
    model: model,
  };
};

// Маппинг внутреннего продукта в API формат
const mapProductToApiPayload = (product: Partial<Product>): ProductCreatePayload | ProductUpdatePayload => {
  const payload: any = {};
  
  if (product.name) payload.title = product.name;
  if (product.description) payload.description = product.description;
  
  // Объединяем specs с артикулом, категорией и подкатегорией
  const specsWithMeta: Record<string, string> = { ...(product.specs || {}) };
  if (product.article) {
    specsWithMeta['Артикул'] = product.article;
  }
  if (product.category) {
    specsWithMeta['Категория'] = product.category;
  }
  if (product.subcategory) {
    specsWithMeta['Подкатегория'] = product.subcategory;
  }
  
  payload.specs = specsWithMeta;
  
  return payload;
};

// Вспомогательная функция для загрузки товаров продавца (используется внутри getProducts)
const loadSellerProducts = async (sellerId: number, page: number = 1, limit: number = 100): Promise<Product[]> => {
  try {
    const response = await apiService.get<any>(`/products/seller/${sellerId}`, false, false, { 
      page: page.toString(), 
      limit: limit.toString() 
    });
    
    let apiProducts: ApiProduct[] = [];
    
    if (Array.isArray(response)) {
      apiProducts = response;
    } else if (response && typeof response === 'object') {
      apiProducts = response.data || response.products || response.items || response;
      
      if (!Array.isArray(apiProducts)) {
        const arrayKey = Object.keys(response).find(key => Array.isArray(response[key]));
        if (arrayKey) {
          apiProducts = response[arrayKey];
        } else {
          return [];
        }
      }
    } else {
      return [];
    }
    
    if (!Array.isArray(apiProducts)) {
      return [];
    }
    
    return apiProducts.map(mapApiProductToProduct);
  } catch (error: any) {
    if (error.status === 404) {
      return [];
    }
    throw error;
  }
};

// Product API endpoints (без префикса /api/)
export const productService = {
  // Search products
  // Пробуем оба формата: /search?q={query} (query param) и /search/{query} (path param)
  async getProducts(searchQuery?: string): Promise<Product[]> {
    try {
      if (searchQuery && searchQuery.trim()) {
        const trimmedQuery = searchQuery.trim();
        // Сначала пробуем формат с query параметром (как в tech-market-place)
        try {
          const apiProducts = await apiService.get<ApiProduct[]>('/search', true, false, { q: trimmedQuery });
          if (apiProducts && Array.isArray(apiProducts)) {
            return apiProducts.map(mapApiProductToProduct);
          }
        } catch (err: any) {
          // Если не сработало (404), пробуем формат с path параметром (как в curl инструкции)
          if (err.status === 404) {
            try {
              const encodedQuery = encodeURIComponent(trimmedQuery);
              const apiProducts = await apiService.get<ApiProduct[]>(`/search/${encodedQuery}`, true);
              if (apiProducts && Array.isArray(apiProducts)) {
                return apiProducts.map(mapApiProductToProduct);
              }
            } catch (err2: any) {
              // Если оба формата не сработали, возвращаем пустой массив
              if (err2.status === 404) {
                return [];
              }
              throw err2;
            }
          } else {
            throw err;
          }
        }
        return [];
      } else {
        // Без поискового запроса пробуем получить все товары
        // Стратегия: пробуем /search/, если не работает - загружаем товары известных продавцов
        
        // Вариант 1: /search/ без параметров
        try {
          const apiProducts = await apiService.get<ApiProduct[]>('/search', true, false);
          if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
            if (import.meta.env.DEV) {
              console.log(`[productService] Загружено товаров с сервера через /search: ${apiProducts.length}`);
            }
            return apiProducts.map(mapApiProductToProduct);
          }
        } catch (err: any) {
          if (err.status !== 404 && import.meta.env.DEV) {
            console.warn('Error fetching all products from /search:', err.message);
          }
        }
        
        if (import.meta.env.DEV) {
          console.log('[productService] /search/ не вернул товары, пробуем загрузить товары продавцов...');
        }
        
        const allProducts: Product[] = [];
        const sellerIdsToTry = [1, 2, 3, 4, 5];
        
        for (const sellerId of sellerIdsToTry) {
          try {
            const sellerProducts = await loadSellerProducts(sellerId, 1, 100);
            if (sellerProducts.length > 0) {
              allProducts.push(...sellerProducts);
              if (import.meta.env.DEV) {
                console.log(`[productService] Загружено ${sellerProducts.length} товаров от продавца ${sellerId}`);
              }
            }
          } catch (err: any) {
            // Игнорируем ошибки для конкретного продавца (может не существовать)
            if (import.meta.env.DEV && err.status !== 404) {
              console.warn(`Error fetching products for seller ${sellerId}:`, err.message);
            }
          }
        }
        
        if (allProducts.length > 0) {
          if (import.meta.env.DEV) {
            console.log(`[productService] Всего загружено товаров от продавцов: ${allProducts.length}`);
          }
          return allProducts;
        }
        
        if (import.meta.env.DEV) {
          console.log('[productService] Не удалось загрузить товары с сервера, будут использованы моковые товары');
        }
        return [];
      }
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      // Логируем ошибки в режиме разработки
      console.warn('Error fetching products:', error.message);
      return [];
    }
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const apiProduct = await apiService.get<ApiProduct>(`/products/${id}`, true);
      return mapApiProductToProduct(apiProduct);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      // Логируем ошибки в режиме разработки
      console.warn(`Error fetching product ${id}:`, error.message);
      return null;
    }
  },

  // Create product (token в заголовке Authorization)
  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    // Добавляем артикул, категорию и подкатегорию в specs для отправки на API
    const specsWithMeta: Record<string, string> = { ...product.specs };
    if (product.article) {
      specsWithMeta['Артикул'] = product.article;
    }
    if (product.category) {
      specsWithMeta['Категория'] = product.category;
    }
    if (product.subcategory) {
      specsWithMeta['Подкатегория'] = product.subcategory;
    }
    
    const payload: ProductCreatePayload = {
      title: product.name,
      description: product.description,
      specs: specsWithMeta,
    };
    
    // Используем Authorization header вместо query параметра (useTokenInQuery: false)
    const apiProduct = await apiService.post<ApiProduct>('/products/', payload, false, false);
    return mapApiProductToProduct(apiProduct);
  },

  // Update product (token в заголовке Authorization)
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const payload = mapProductToApiPayload(product);
    const response = await apiService.put<ProductUpdateResponse>(`/products/${id}`, payload, false, false);
    return mapApiProductToProduct(response.product);
  },

  // Delete product (token в заголовке Authorization)
  async deleteProduct(id: string): Promise<void> {
    try {
      await apiService.delete(`/products/${id}`, false, false);
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('Endpoint для удаления продукта не найден');
      }
      throw error;
    }
  },

  // Get seller products (with pagination support)
  async getSellerProducts(sellerId: string | number, page: number = 1, limit: number = 100): Promise<Product[]> {
    try {
      // API требует числовой seller_id, поэтому преобразуем ID в число
      // Для mock пользователей используем фиксированный ID для разработки (можно изменить на нужный)
      let numericSellerId: number;
      
      // Если sellerId уже число, используем его напрямую
      if (typeof sellerId === 'number') {
        numericSellerId = sellerId;
      } else if (typeof sellerId === 'string') {
        // Если это строка, проверяем на mock
        if (sellerId.startsWith('mock-')) {
          numericSellerId = 1;
          console.log(`Mock пользователь: используем фиксированный seller_id=${numericSellerId} для разработки`);
        } else {
          // Для реальных пользователей пробуем преобразовать строку в число
          numericSellerId = parseInt(sellerId, 10);
          if (isNaN(numericSellerId)) {
            console.warn(`Не удалось преобразовать sellerId "${sellerId}" в число, используется 1`);
            numericSellerId = 1;
          }
        }
      } else {
        console.warn(`Неожиданный тип sellerId: ${typeof sellerId}, используется 1`);
        numericSellerId = 1;
      }
      
      console.log(`Запрос товаров продавца: sellerId=${sellerId} -> numericId=${numericSellerId}, page=${page}, limit=${limit}`);
      
      // Запрашиваем с параметрами пагинации (limit=100 чтобы получить максимум товаров)
      const response = await apiService.get<any>(`/products/seller/${numericSellerId}`, false, false, { 
        page: page.toString(), 
        limit: limit.toString() 
      });
      
      console.log('Ответ от API /products/seller:', response);
      console.log('Тип ответа:', typeof response, 'isArray:', Array.isArray(response));
      
      // API может вернуть либо массив, либо объект с пагинацией
      let apiProducts: ApiProduct[] = [];
      
      if (Array.isArray(response)) {
        // Если ответ - массив, используем его напрямую
        apiProducts = response;
        console.log('Ответ - массив, количество товаров:', apiProducts.length);
      } else if (response && typeof response === 'object') {
        // Если ответ - объект с пагинацией, извлекаем массив товаров
        // Возможные варианты: response.data, response.products, response.items, или сам response
        apiProducts = response.data || response.products || response.items || response;
        
        // Если это не массив, пробуем найти массив внутри объекта
        if (!Array.isArray(apiProducts)) {
          // Ищем первый массив в объекте
          const arrayKey = Object.keys(response).find(key => Array.isArray(response[key]));
          if (arrayKey) {
            apiProducts = response[arrayKey];
            console.log(`Найден массив в ключе "${arrayKey}", количество товаров:`, apiProducts.length);
          } else {
            console.warn('Unexpected response format from /products/seller:', response);
            console.warn('Ключи объекта:', Object.keys(response));
            return [];
          }
        } else {
          console.log('Извлечен массив из объекта, количество товаров:', apiProducts.length);
        }
      } else {
        console.warn('Неожиданный формат ответа:', typeof response, response);
        return [];
      }
      
      if (!Array.isArray(apiProducts)) {
        console.warn('Expected array of products, got:', typeof apiProducts);
        return [];
      }
      
      const mappedProducts = apiProducts.map(mapApiProductToProduct);
      console.log('Преобразовано товаров:', mappedProducts.length);
      return mappedProducts;
    } catch (error: any) {
      if (error.status === 404) {
        console.warn(`404: Товары для продавца ${sellerId} не найдены`);
        return [];
      }
      // Логируем ошибки для отладки
      console.error(`Error fetching seller products for ${sellerId}:`, error.message);
      console.error('Error details:', error);
      return [];
    }
  },

  async getCategories(): Promise<Category[]> {
    return [];
  },
};
