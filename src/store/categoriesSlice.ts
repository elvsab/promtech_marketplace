import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../models';
import { productService } from '../services';
import { CATEGORIES } from '../models/constants';

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  selectedCategoryId: string | null;
  selectedSubcategory: string | null;
}

const initialState: CategoriesState = {
  categories: CATEGORIES,
  isLoading: false,
  error: null,
  selectedCategoryId: null,
  selectedSubcategory: null,
};

// Async thunk для загрузки категорий
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await productService.getCategories();
      return categories && categories.length > 0 ? categories : CATEGORIES;
    } catch (error: any) {
      // При ошибке возвращаем категории из констант
      return CATEGORIES;
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategoryId = action.payload;
      // Сбрасываем подкатегорию при смене категории
      if (action.payload !== state.selectedCategoryId) {
        state.selectedSubcategory = null;
      }
    },
    setSelectedSubcategory: (state, action: PayloadAction<string | null>) => {
      state.selectedSubcategory = action.payload;
    },
    resetSelection: (state) => {
      state.selectedCategoryId = null;
      state.selectedSubcategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Не удалось загрузить категории';
        // Используем категории из констант при ошибке
        state.categories = CATEGORIES;
      });
  },
});

export const { setCategories, setSelectedCategory, setSelectedSubcategory, resetSelection } = categoriesSlice.actions;
export default categoriesSlice.reducer;

