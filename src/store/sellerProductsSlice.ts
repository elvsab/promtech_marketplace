import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../models';
import { productService } from '../services';

interface SellerProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProductId: string | null;
}

const initialState: SellerProductsState = {
  products: [],
  isLoading: false,
  error: null,
  selectedProductId: null,
};

// Async thunk для загрузки товаров продавца
export const fetchSellerProducts = createAsyncThunk(
  'sellerProducts/fetchSellerProducts',
  async (sellerId: string, { rejectWithValue }) => {
    try {
      const products = await productService.getSellerProducts(sellerId, 1, 100);
      return products;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось загрузить товары');
    }
  }
);

// Async thunk для создания товара
export const createSellerProduct = createAsyncThunk(
  'sellerProducts/createProduct',
  async (product: Omit<Product, 'id'>, { rejectWithValue }) => {
    try {
      const newProduct = await productService.createProduct(product);
      return newProduct;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось создать товар');
    }
  }
);

// Async thunk для обновления товара
export const updateSellerProduct = createAsyncThunk(
  'sellerProducts/updateProduct',
  async ({ id, product }: { id: string; product: Partial<Product> }, { rejectWithValue }) => {
    try {
      const updatedProduct = await productService.updateProduct(id, product);
      return updatedProduct;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось обновить товар');
    }
  }
);

// Async thunk для удаления товара
export const deleteSellerProduct = createAsyncThunk(
  'sellerProducts/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось удалить товар');
    }
  }
);

const sellerProductsSlice = createSlice({
  name: 'sellerProducts',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      const existingIndex = state.products.findIndex(p => p.id === action.payload.id);
      if (existingIndex >= 0) {
        state.products[existingIndex] = action.payload;
      } else {
        state.products.push(action.payload);
      }
    },
    updateProduct: (state, action: PayloadAction<{ id: string; product: Partial<Product> }>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index >= 0) {
        state.products[index] = { ...state.products[index], ...action.payload.product };
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    setSelectedProduct: (state, action: PayloadAction<string | null>) => {
      state.selectedProductId = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.selectedProductId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch seller products
      .addCase(fetchSellerProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка загрузки товаров';
      })
      // Create product
      .addCase(createSellerProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSellerProduct.fulfilled, (state, action) => {
        const existingIndex = state.products.findIndex(p => p.id === action.payload.id);
        if (existingIndex >= 0) {
          state.products[existingIndex] = action.payload;
        } else {
          state.products.push(action.payload);
        }
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createSellerProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка создания товара';
      })
      // Update product
      .addCase(updateSellerProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSellerProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index >= 0) {
          state.products[index] = action.payload;
        }
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateSellerProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка обновления товара';
      })
      // Delete product
      .addCase(deleteSellerProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSellerProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
        if (state.selectedProductId === action.payload) {
          state.selectedProductId = null;
        }
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteSellerProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка удаления товара';
      });
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setSelectedProduct,
  clearProducts,
} = sellerProductsSlice.actions;

export default sellerProductsSlice.reducer;

