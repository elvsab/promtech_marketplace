import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setLoading, loginSuccess, logout as logoutAction, setUser, setError } from '../store';
import { authService } from '../services';
import { User } from '../models';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  // Функция для загрузки пользователя
  const loadUser = useCallback(async () => {
    // Если токен был удален, очищаем пользователя
    if (!authService.isAuthenticated()) {
      dispatch(setUser(null));
      dispatch(setLoading(false));
      return;
    }

    dispatch(setLoading(true));
    try {
      // Пробуем загрузить пользователя, но если endpoint не существует (405), это нормально
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        dispatch(setUser(currentUser));
      } else {
        // Если пользователь не загружен (endpoint не существует), но токен есть,
        // это нормально - пользователь будет загружен при следующем логине
        dispatch(setUser(null));
      }
    } catch (error: any) {
      // Если ошибка 405 (Method Not Allowed) или 404 - это нормально, endpoint не существует
      if (error?.status === 405 || error?.status === 404) {
        dispatch(setUser(null));
        // Не логируем эти ошибки, так как это ожидаемое поведение
      } else {
        // Для других ошибок логируем
        dispatch(setUser(null));
        if (import.meta.env.DEV) {
          console.error('Failed to load user:', error);
        }
      }
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Check for existing token and load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = (userData: User, token?: string) => {
    // Сохраняем токен в authService, если он передан
    if (token) {
      authService.getToken(); // Проверяем, что токен уже сохранен в authService
    }
    dispatch(loginSuccess({ user: userData, token: token || authService.getToken() || undefined }));
  };

  const logout = () => {
    // Сначала очищаем токен и данные в authService
    authService.logout();
    // Затем очищаем состояние в Redux
    dispatch(logoutAction());
  };

  return {
    user,
    isLoggedIn: isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setUser: (user: User | null) => dispatch(setUser(user)),
  };
};
