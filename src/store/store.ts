import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import categoriesReducer from './categoriesSlice';
import searchReducer from './searchSlice';
import sellerProductsReducer from './sellerProductsSlice';
import productGroupsReducer from './productGroupsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    search: searchReducer,
    sellerProducts: sellerProductsReducer,
    productGroups: productGroupsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем некоторые поля, которые могут содержать несериализуемые данные
        ignoredActions: ['search/setProducts', 'sellerProducts/setProducts'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

