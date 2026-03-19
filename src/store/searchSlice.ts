import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../models';
import { PRODUCTS } from '../models/constants';
import { productService } from '../services';

export interface SearchFilters {
  category?: string | null;
  subcategory?: string | null;
  minPrice?: number;
  maxPrice?: number;
  [key: string]: any; // Для динамических фильтров
}

interface SearchState {
  products: Product[];
  filteredProducts: Product[];
  searchQuery: string;
  filters: SearchFilters;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  currentPage: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

// Инициализируем с моковыми товарами для немедленного отображения
const initialState: SearchState = {
  products: PRODUCTS,
  filteredProducts: PRODUCTS,
  searchQuery: '',
  filters: {},
  sortBy: 'relevance',
  currentPage: 1,
  totalPages: 1,
  totalCount: PRODUCTS.length,
  isLoading: false,
  error: null,
};

// Async thunk для поиска товаров
export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async (params: { query?: string; filters?: SearchFilters; page?: number; sort?: string }, { rejectWithValue }) => {
    try {
      const products = await productService.getProducts(params.query);
      // Если API вернул товары, возвращаем их (моковые товары уже в initialState)
      // Если API вернул пустой массив и нет поискового запроса, возвращаем пустой массив
      // (моковые товары останутся в state из initialState)
      return products;
    } catch (error: any) {
      // При ошибке возвращаем пустой массив (моковые товары останутся в state)
      if (!params.query) {
        // Для запроса всех товаров при ошибке возвращаем пустой массив
        // чтобы не перезаписать моковые товары
        return [];
      }
      return rejectWithValue(error.message || 'Не удалось выполнить поиск');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Сбрасываем страницу при новом поиске
      applyFilters(state);
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
      applyFilters(state);
    },
    updateFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      if (value === null || value === undefined || value === '') {
        delete state.filters[key];
      } else {
        state.filters[key] = value;
      }
      state.currentPage = 1;
      applyFilters(state);
    },
    setSortBy: (state, action: PayloadAction<'relevance' | 'price_asc' | 'price_desc' | 'newest'>) => {
      state.sortBy = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.filters = {};
      state.currentPage = 1;
      state.sortBy = 'relevance';
      applyFilters(state);
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      // Объединяем новые товары с существующими, избегая дублирования
      const newProducts = action.payload;
      const existingIds = new Set(state.products.map(p => p.id));
      const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
      
      if (import.meta.env.DEV) {
        console.log(`[searchSlice.setProducts] Добавляем товары: ${newProducts.length} новых, ${uniqueNewProducts.length} уникальных`);
        console.log(`[searchSlice.setProducts] Было товаров: ${state.products.length}`);
      }
      
      state.products = [...state.products, ...uniqueNewProducts];
      
      if (import.meta.env.DEV) {
        console.log(`[searchSlice.setProducts] Стало товаров: ${state.products.length}`);
      }
      
      // Автоматически применяем фильтры при обновлении продуктов
      applyFilters(state);
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      const existingIndex = state.products.findIndex(p => p.id === action.payload.id);
      if (existingIndex >= 0) {
        state.products[existingIndex] = action.payload;
      } else {
        state.products.push(action.payload);
      }
      applyFilters(state);
    },
    updateProduct: (state, action: PayloadAction<{ id: string; product: Partial<Product> }>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index >= 0) {
        state.products[index] = { ...state.products[index], ...action.payload.product };
        applyFilters(state);
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
      applyFilters(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        // Объединяем новые товары с существующими, избегая дублирования
        const newProducts = action.payload;
        if (import.meta.env.DEV) {
          console.log(`[searchSlice] Получено товаров с сервера: ${newProducts.length}`);
          if (newProducts.length > 0) {
            console.log('[searchSlice] Пример товара с сервера:', newProducts[0]);
          }
        }
        
        if (newProducts.length > 0) {
          // Если есть товары с сервера, объединяем их с существующими
          const existingIds = new Set(state.products.map(p => p.id));
          const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
          
          if (import.meta.env.DEV) {
            console.log(`[searchSlice] Уникальных новых товаров: ${uniqueNewProducts.length} из ${newProducts.length}`);
            console.log(`[searchSlice] Существующих товаров до объединения: ${state.products.length}`);
          }
          
          // Объединяем: сначала товары с сервера (всех пользователей), потом моковые (если они еще не были добавлены)
          // Это гарантирует, что товары всех пользователей отображаются независимо от авторизации
          state.products = [...newProducts, ...state.products.filter(p => !newProducts.some(np => np.id === p.id))];
          
          if (import.meta.env.DEV) {
            console.log(`[searchSlice] Всего товаров после объединения: ${state.products.length}`);
            console.log(`[searchSlice] Применяем фильтры...`);
          }
        } else {
          // Если новых товаров нет, оставляем существующие (моковые товары из initialState)
          if (import.meta.env.DEV) {
            console.log(`[searchSlice] Товары с сервера не загружены, используются моковые товары: ${state.products.length}`);
          }
        }
        state.isLoading = false;
        state.error = null;
        applyFilters(state);
        
        if (import.meta.env.DEV) {
          console.log(`[searchSlice] Отфильтровано товаров: ${state.filteredProducts.length} из ${state.products.length}`);
        }
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка поиска';
      });
  },
});

// Функция для применения фильтров
function applyFilters(state: SearchState) {
  let result = [...state.products];
  
  if (import.meta.env.DEV) {
    console.log(`[applyFilters] Начало фильтрации: ${result.length} товаров`);
    console.log(`[applyFilters] Активные фильтры:`, state.filters);
    console.log(`[applyFilters] Поисковый запрос: "${state.searchQuery}"`);
  }

  // Фильтр по категории
  if (state.filters.category) {
    const beforeCount = result.length;
    result = result.filter(p => p.category === state.filters.category);
    if (import.meta.env.DEV) {
      console.log(`[applyFilters] После фильтра по категории "${state.filters.category}": ${result.length} из ${beforeCount}`);
    }
  }

  // Фильтр по подкатегории
  if (state.filters.subcategory) {
    const beforeCount = result.length;
    result = result.filter(p => p.subcategory === state.filters.subcategory);
    if (import.meta.env.DEV) {
      console.log(`[applyFilters] После фильтра по подкатегории "${state.filters.subcategory}": ${result.length} из ${beforeCount}`);
    }
  }

  // Фильтр по поисковому запросу
  if (state.searchQuery) {
    const lowerQuery = state.searchQuery.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      (p.article && p.article.toLowerCase().includes(lowerQuery))
    );
  }

  // Фильтр по цене
  if (state.filters.minPrice !== undefined) {
    result = result.filter(p => p.price >= state.filters.minPrice!);
  }
  if (state.filters.maxPrice !== undefined) {
    result = result.filter(p => p.price <= state.filters.maxPrice!);
  }

  // Сортировка
  switch (state.sortBy) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      // Предполагаем, что новые товары имеют больший id (можно улучшить)
      result.sort((a, b) => b.id.localeCompare(a.id));
      break;
    default:
      // relevance - оставляем как есть
      break;
  }

  state.filteredProducts = result;
  state.totalCount = result.length;
  state.totalPages = Math.ceil(result.length / 20); // Предполагаем 20 товаров на страницу
  
  if (import.meta.env.DEV) {
    console.log(`[applyFilters] Итоговый результат: ${result.length} товаров`);
    if (result.length === 0 && state.products.length > 0) {
      console.warn('[applyFilters] ВНИМАНИЕ: Все товары отфильтрованы! Проверьте активные фильтры.');
    }
  }
}

export const {
  setSearchQuery,
  setFilters,
  updateFilter,
  setSortBy,
  setPage,
  resetFilters,
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
} = searchSlice.actions;

export default searchSlice.reducer;

