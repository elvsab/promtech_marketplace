import { apiService, ApiError } from './apiService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  company_name: string;
  // name не требуется API, но может быть использован для отображения
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Ответ от /token endpoint
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Ответ от /register endpoint
export interface RegisterResponse {
  id: number; // API возвращает число
  email: string;
  company_name: string;
  name?: string; // Может отсутствовать в ответе
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  company_name?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'mock_user';
  private readonly REAL_USER_KEY = 'real_user';
  private readonly MOCK_MODE = true;

  // Декодирует JWT токен и извлекает payload
  private decodeJWT(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  // Извлекает user ID из JWT токена
  private extractUserIdFromToken(token: string): string | null {
    const decoded = this.decodeJWT(token);
    if (!decoded) return null;
    
    // Пробуем разные возможные поля для ID пользователя
    return decoded.sub || decoded.user_id || decoded.id || decoded.userId || null;
  }

  // Mock авторизация (работает локально без API)
  // Публичный метод для использования в разработке
  mockAuth(data: { name: string; email: string }): AuthResponse {
    const mockUser = {
      id: `mock-${Date.now()}`,
      name: data.name,
      email: data.email,
    };

    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Сохраняем mock пользователя и токен
    localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));
    this.saveToken(mockToken);

    return {
      token: mockToken,
      user: mockUser,
    };
  }

  // Получить mock пользователя из localStorage
  private getMockUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch {
      return null;
    }
    return null;
  }

  // Login (использует новый endpoint /token)
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Используем новый endpoint /token с form-urlencoded данными
      const formData = {
        grant_type: 'password',
        username: credentials.email, // OAuth2 использует username для email
        password: credentials.password,
      };

      const tokenResponse = await apiService.post<TokenResponse>(
        '/token',
        formData,
        false,
        false,
        undefined,
        'form-urlencoded'
      );

      // Сохраняем токен
      const accessToken = tokenResponse.access_token;
      this.saveToken(accessToken);

      // Пытаемся извлечь ID пользователя из JWT токена
      const userIdFromToken = this.extractUserIdFromToken(accessToken);
      
      // API не предоставляет endpoint для получения текущего пользователя
      // Используем ID из токена, если он там есть, иначе используем email как временный идентификатор
      const user = {
        id: userIdFromToken ? String(userIdFromToken) : '', // ID из токена или пустая строка
        name: credentials.email, // Временно используем email как имя
        email: credentials.email,
      };
      
      // Сохраняем пользователя в localStorage
      this.saveRealUser(user);
      
      return {
        token: accessToken,
        user,
      };
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Неверный email или пароль.');
      }
      if (error.status === 400) {
        throw new Error(error.message || 'Неверные данные для входа.');
      }
      if (this.MOCK_MODE && (error.status === 404 || error.message?.includes('Network'))) {
        console.warn('API недоступен, используется mock авторизация');
        return this.mockAuth({
          name: 'Иван Инженер',
          email: credentials.email,
        });
      }
      throw new Error(error.message || 'Ошибка при входе. Попробуйте позже.');
    }
  }

  // Register (использует новый endpoint /register)
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Используем новый endpoint /register
      // API требует только: email, password, company_name (без name)
      const registerResponse = await apiService.post<RegisterResponse>('/register', {
        email: data.email,
        password: data.password,
        company_name: data.company_name,
      }, false, false, undefined, 'json');
      
      console.log('Register response:', registerResponse);

      try {
        const formData = {
          grant_type: 'password',
          username: data.email,
          password: data.password,
        };

        const tokenResponse = await apiService.post<TokenResponse>(
          '/token',
          formData,
          false,
          false,
          undefined,
          'form-urlencoded'
        );

        const accessToken = tokenResponse.access_token;
        this.saveToken(accessToken);

        const user = {
          id: String(registerResponse.id), // Преобразуем число в строку - это реальный ID пользователя
          name: registerResponse.name || registerResponse.company_name || registerResponse.email, // Используем name, company_name или email
          email: registerResponse.email,
          company_name: registerResponse.company_name, // Сохраняем company_name
        };
        
        // Сохраняем пользователя в localStorage (так как API не предоставляет GET endpoint)
        this.saveRealUser(user);
        
        return {
          token: accessToken,
          user,
        };
      } catch (loginError: any) {
        throw new Error('Регистрация прошла успешно, но не удалось выполнить автоматический вход. Пожалуйста, войдите вручную.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.status === 422) {
        const errorMessage = error.message || error.details?.message || '';
        if (errorMessage) {
          throw new Error(errorMessage);
        }
        throw new Error('Неверные данные для регистрации. Проверьте, что все поля заполнены правильно.');
      }
      
      if (error.status === 400) {
        // Проверяем, не связано ли это с дублированием email
        const errorMessage = error.message || error.details?.message || '';
        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('уже') || errorMessage.toLowerCase().includes('exists')) {
          throw new Error('Пользователь с таким email уже существует.');
        }
        throw new Error(errorMessage || 'Неверные данные для регистрации.');
      }
      
      if (error.status === 409) {
        throw new Error('Пользователь с таким email уже существует.');
      }
      
      if (this.MOCK_MODE && (error.status === 404 || error.message?.includes('Network'))) {
        console.warn('API недоступен, используется mock регистрация');
        return this.mockAuth({
          name: data.name,
          email: data.email,
        });
      }
      
      throw new Error(error.message || 'Ошибка при регистрации. Попробуйте позже.');
    }
  }

  // Update user profile (token в query параметре)
  async updateProfile(data: UpdateProfileData): Promise<{ status: string; message: string }> {
    try {
      // API возвращает {status: "success", message: "Профиль обновлен"}
      return await apiService.put<{ status: string; message: string }>('/users/me', data, false, true);
    } catch (error: any) {
      // Если API недоступен, обновляем mock пользователя локально
      if (error.status === 404 && this.MOCK_MODE) {
        const mockUser = this.getMockUser();
        if (mockUser) {
          const updatedUser = { ...mockUser, ...data };
          localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
          return { status: 'success', message: 'Профиль обновлен' };
        }
        throw new Error('Пользователь не найден');
      }
      if (error.status === 401 || error.status === 403) {
        throw new Error('Необходима авторизация для обновления профиля.');
      }
      if (error.status === 400) {
        throw new Error(error.message || 'Неверные данные для обновления профиля.');
      }
      throw new Error(error.message || 'Ошибка при обновлении профиля.');
    }
  }

  // Logout
  logout(): void {
    // Очищаем токен
    this.removeToken();
    // Очищаем mock пользователя
    localStorage.removeItem(this.USER_KEY);
    // Очищаем реального пользователя
    localStorage.removeItem(this.REAL_USER_KEY);
    // Очищаем все данные авторизации
    localStorage.removeItem('auth_token');
  }

  // Get current token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Save token
  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Remove token
  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Сохранить реального пользователя в localStorage
  private saveRealUser(user: User): void {
    localStorage.setItem(this.REAL_USER_KEY, JSON.stringify(user));
  }

  // Получить реального пользователя из localStorage
  private getRealUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.REAL_USER_KEY);
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch {
      return null;
    }
    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    // Если токен начинается с "mock_", это mock пользователь
    if (token.startsWith('mock_token_')) {
      return this.getMockUser();
    }

    // Для реальных токенов возвращаем сохраненного пользователя из localStorage
    // (так как API не предоставляет GET endpoint для получения текущего пользователя)
    const savedUser = this.getRealUser();
    if (savedUser) {
      return savedUser;
    }

    // Если пользователь не сохранен, возвращаем null
    // Пользователь будет загружен при следующем логине/регистрации
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Если есть mock токен, проверяем наличие mock пользователя
    if (token.startsWith('mock_token_')) {
      return !!this.getMockUser();
    }

    return true;
  }
}

export const authService = new AuthService();
