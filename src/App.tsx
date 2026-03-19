import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Header, Footer, AuthModal } from './views';
import { ShopPage, DashboardPage, DesignSystemPage, ProductGroupsPage, ProductsPositionsPage, OrdersPage } from './pages';
import { DashboardLayout } from './views';
import { CATEGORIES, Product } from './models';
import { useAuth, useCategories } from './hooks';
import { authService } from './services';
import { useAppDispatch, useAppSelector } from './store';
import {
  fetchSellerProducts,
  createSellerProduct,
  updateSellerProduct as updateSellerProductAsync,
  deleteSellerProduct,
  setSearchQuery,
  setSelectedCategory,
  setSelectedSubcategory,
  searchProducts,
  setProducts,
  addSearchProduct,
  updateSearchProduct,
  removeSearchProduct,
  updateFilter,
} from './store';
import './styles/App.scss';
import './styles/main.scss';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const sellerProducts = useAppSelector((state) => state.sellerProducts.products);
  const searchState = useAppSelector((state) => state.search);
  const categories = useCategories(CATEGORIES.length > 0 ? CATEGORIES : undefined);

  useEffect(() => {
    if (location.pathname === '/' && searchState.products.length === 0) {
      dispatch(searchProducts({}));
    }
  }, [location.pathname, searchState.products.length, dispatch]);

  useEffect(() => {
    if (auth.isLoggedIn && auth.user && auth.user.id) {
      if (location.pathname === '/dashboard' || location.pathname === '/') {
        dispatch(fetchSellerProducts(auth.user.id));
      }
    }
  }, [location.pathname, auth.isLoggedIn, auth.user?.id, dispatch]);

  useEffect(() => {
    if (location.pathname === '/' && sellerProducts.length > 0) {
      dispatch(setProducts(sellerProducts));
    }
  }, [location.pathname, sellerProducts, dispatch]);

  useEffect(() => {
    const wasLoggedOut = sessionStorage.getItem('was_logged_out');
    
    if (location.pathname === '/dashboard' && !auth.isLoggedIn && !auth.isLoading && !wasLoggedOut) {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        const mockResponse = authService.mockAuth({
          name: 'Иван Инженер',
          email: 'dev@promtech.ru',
        });
        auth.login(mockResponse.user);
      }
    }
    
    if (wasLoggedOut) {
      sessionStorage.removeItem('was_logged_out');
    }
  }, [location.pathname, auth.isLoggedIn, auth.isLoading]);

  const getCurrentView = () => {
    if (location.pathname === '/') return 'shop';
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname === '/design-system') return 'design-system';
    return 'shop';
  };

  const handleLoginClick = () => {
    if (auth.isLoggedIn) {
      auth.logout();
      navigate('/');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (user: { id: string; name: string; email: string }, token?: string) => {
    auth.login(user, token);
    setIsAuthModalOpen(false);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    sessionStorage.setItem('was_logged_out', 'true');
    auth.logout();
    navigate('/');
  };

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    if (auth.user?.id) {
      const result = await dispatch(createSellerProduct(product));
      if (createSellerProduct.fulfilled.match(result)) {
        const newProduct = result.payload;
        dispatch(addSearchProduct(newProduct));
        dispatch(fetchSellerProducts(auth.user.id));
        dispatch(searchProducts({}));
      }
    }
  };

  const handleUpdateProduct = async (id: string, product: Partial<Product>) => {
    if (auth.user?.id) {
      const result = await dispatch(updateSellerProductAsync({ id, product }));
      if (updateSellerProductAsync.fulfilled.match(result)) {
        const updatedProduct = result.payload;
        dispatch(updateSearchProduct({ id: updatedProduct.id, product: updatedProduct as Partial<Product> }));
        dispatch(fetchSellerProducts(auth.user.id));
        dispatch(searchProducts({}));
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар? Это действие необратимо.') && auth.user?.id) {
      const result = await dispatch(deleteSellerProduct(id));
      if (deleteSellerProduct.fulfilled.match(result)) {
        dispatch(removeSearchProduct(id));
        dispatch(fetchSellerProducts(auth.user.id));
        dispatch(searchProducts({}));
      }
    }
  };

  const handleNavigate = (view: string) => {
    if (view === 'shop') navigate('/');
    else if (view === 'dashboard') navigate('/dashboard');
    else if (view === 'design-system') navigate('/design-system');
  };

  return (
    <div className="app">
      <Header 
        onToggleSidebar={() => {}}
        isLoggedIn={auth.isLoggedIn}
        onLoginClick={handleLoginClick}
        onSearch={(query) => dispatch(setSearchQuery(query))}
        onNavigate={handleNavigate}
        currentView={getCurrentView()}
        onSelectCategory={(id) => {
          dispatch(setSelectedCategory(id));
          dispatch(setSelectedSubcategory(null));
          dispatch(updateFilter({ key: 'category', value: id }));
          dispatch(updateFilter({ key: 'subcategory', value: null }));
        }}
        onSelectSubcategory={(subcategory) => {
          dispatch(setSelectedSubcategory(subcategory));
          dispatch(updateFilter({ key: 'subcategory', value: subcategory }));
        }}
      />

      <Routes>
        <Route path="/" element={<ShopPage categories={categories} />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route 
          path="/dashboard" 
          element={
            auth.isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>
            ) : auth.isLoggedIn && auth.user ? (
              <DashboardLayout user={auth.user}>
                <DashboardPage 
                  user={auth.user}
                  products={sellerProducts}
                  categories={categories.categories}
                  onDelete={handleDeleteProduct}
                  onEdit={handleUpdateProduct}
                  onAdd={handleAddProduct}
                  onLogout={handleLogout}
                />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/dashboard/products/positions" 
          element={
            auth.isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>
            ) : auth.isLoggedIn && auth.user ? (
              <DashboardLayout user={auth.user}>
                <ProductsPositionsPage 
                  user={auth.user}
                  products={sellerProducts}
                  onDelete={handleDeleteProduct}
                  onEdit={handleUpdateProduct}
                  onAdd={handleAddProduct}
                />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/dashboard/groups" 
          element={
            auth.isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>
            ) : auth.isLoggedIn && auth.user ? (
              <DashboardLayout user={auth.user}>
                <ProductGroupsPage 
                  user={auth.user}
                  products={sellerProducts}
                />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/dashboard/orders" 
          element={
            auth.isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>
            ) : auth.isLoggedIn && auth.user ? (
              <DashboardLayout user={auth.user}>
                <OrdersPage user={auth.user} />
              </DashboardLayout>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="*" element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>404</h1>
            <p>Страница не найдена</p>
            <button onClick={() => navigate('/')}>Вернуться на главную</button>
          </div>
        } />
      </Routes>

      <Footer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
