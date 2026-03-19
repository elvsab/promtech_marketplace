import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCategories, setCategories } from '../store';
import { Category } from '../models';
import { CATEGORIES } from '../models/constants';

export const useCategories = (initialCategories?: Category[]) => {
  const dispatch = useAppDispatch();
  const { categories, isLoading, error, selectedCategoryId, selectedSubcategory } = useAppSelector(
    (state) => state.categories
  );

  useEffect(() => {
    // Если переданы начальные категории, используем их
    if (initialCategories && initialCategories.length > 0) {
      dispatch(setCategories(initialCategories));
    } else if (categories.length === 0 || categories === CATEGORIES) {
      // Загружаем категории из API, если они еще не загружены
      dispatch(fetchCategories());
    }
  }, [dispatch, initialCategories]);

  return {
    categories,
    isLoading,
    error,
    selectedCategoryId,
    selectedSubcategory,
    loadCategories: () => dispatch(fetchCategories()),
  };
};

