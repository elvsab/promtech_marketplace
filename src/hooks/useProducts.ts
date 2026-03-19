import { useState, useEffect } from 'react';
import { Product } from '../models';
import { productService } from '../services';

export const useProducts = (initialProducts?: Product[]) => {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts || []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products from API on mount if no initial products provided
  useEffect(() => {
    // Если initialProducts не передан (undefined) или это пустой массив, загружаем из API
    if (initialProducts === undefined || (Array.isArray(initialProducts) && initialProducts.length === 0)) {
      loadProducts();
    }
  }, []);

  // Load products from API with optional search query
  const loadProducts = async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedProducts = await productService.getProducts(search);
      if (loadedProducts.length > 0) {
        // Если есть поисковый запрос, заменяем весь список
        // Иначе объединяем с существующими, избегая дублирования
        if (search) {
          setAllProducts(loadedProducts);
        } else {
          setAllProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = loadedProducts.filter(p => !existingIds.has(p.id));
            // Объединяем: сначала существующие, потом новые из API
            return [...prev, ...newProducts];
          });
        }
        // Фильтрация произойдет автоматически через useEffect
      } else if (!initialProducts || initialProducts.length === 0) {
        // Если API вернул пустой массив и нет fallback данных, показываем ошибку
        // Но только если нет локально добавленных товаров
        if (allProducts.length === 0) {
          setError('Товары не найдены');
        }
      }
    } catch (err) {
      // При ошибке не показываем ошибку, если есть локально добавленные товары
      if (allProducts.length === 0) {
        setError('Не удалось загрузить товары');
      }
      if (import.meta.env.DEV) {
        console.error('Error loading products:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products locally (client-side filtering)
  useEffect(() => {
    let result = allProducts;

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (selectedSubcategory) {
      result = result.filter(p => p.subcategory === selectedSubcategory);
    }

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.description.toLowerCase().includes(lowerQ) ||
        (p.article && p.article.toLowerCase().includes(lowerQ))
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, selectedSubcategory, searchQuery, allProducts]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productService.createProduct(product);
      setAllProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      throw new Error(err.message || 'Не удалось добавить товар');
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const updatedProduct = await productService.updateProduct(id, product);
      setAllProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err: any) {
      throw new Error(err.message || 'Не удалось обновить товар');
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар? Это действие необратимо.')) {
      try {
        await productService.deleteProduct(id);
        setAllProducts(prev => prev.filter(p => p.id !== id));
      } catch (err: any) {
        alert(err.message || 'Не удалось удалить товар');
        if (import.meta.env.DEV) {
          console.error('Error deleting product:', err);
        }
      }
    }
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
  };

  return {
    allProducts,
    filteredProducts,
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    isLoading,
    error,
    setAllProducts,
    setSelectedCategory,
    setSelectedSubcategory,
    setSearchQuery,
    addProduct,
    updateProduct,
    deleteProduct,
    resetFilters,
    loadProducts,
  };
};
