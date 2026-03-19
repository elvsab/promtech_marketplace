export { store } from './store';
export type { RootState, AppDispatch } from './store';
export { useAppDispatch, useAppSelector } from './hooks';

// Auth exports
export {
  setLoading,
  loginSuccess,
  logout,
  setUser,
  setError,
  updateUser,
} from './authSlice';

// Categories exports
export {
  setCategories,
  setSelectedCategory,
  setSelectedSubcategory,
  resetSelection,
  fetchCategories,
} from './categoriesSlice';

// Search exports
export {
  setSearchQuery,
  setFilters,
  updateFilter,
  setSortBy,
  setPage,
  resetFilters,
  setProducts,
  addProduct as addSearchProduct,
  updateProduct as updateSearchProduct,
  removeProduct as removeSearchProduct,
  searchProducts,
} from './searchSlice';

// Seller Products exports
export {
  setProducts as setSellerProducts,
  addProduct as addSellerProduct,
  updateProduct as updateSellerProduct,
  removeProduct as removeSellerProduct,
  setSelectedProduct,
  clearProducts,
  fetchSellerProducts,
  createSellerProduct,
  updateSellerProduct as updateSellerProductAsync,
  deleteSellerProduct,
} from './sellerProductsSlice';

// Product Groups exports
export {
  loadGroupsForSeller,
  addGroup,
  updateGroup,
  deleteGroup,
  selectGroup,
  addProductToGroup,
  removeProductFromGroup,
  moveProductToGroup,
  clearGroups,
  initializeWithRootGroup,
} from './productGroupsSlice';

