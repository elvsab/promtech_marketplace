import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { authService, LoginCredentials, RegisterData } from '../services';
import '../styles/components/AuthModal.scss';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; name: string; email: string }, token?: string) => void;
}

type AuthMode = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const credentials: LoginCredentials = {
        email,
        password,
      };

      const response = await authService.login(credentials);
      onSuccess(response.user, response.token);
      onClose();
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа. Проверьте данные.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data: RegisterData = {
        email,
        password,
        company_name: companyName,
        name: name || companyName,
      };

      const response = await authService.register(data);
      onSuccess(response.user, response.token);
      onClose();
      setEmail('');
      setPassword('');
      setName('');
      setCompanyName('');
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setCompanyName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
      showCloseButton={false}
    >
      <div className="auth-modal">
        <button 
          onClick={onClose}
          className="auth-close-button"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>

        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <Lock size={24} />
          </div>
          <h2 className="auth-title">
            {mode === 'login' ? 'С возвращением!' : 'Создать аккаунт'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Войдите, чтобы управлять заказами' 
              : 'Присоединяйтесь к крупнейшему маркетплейсу'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="auth-form-container">
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="auth-form">
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label htmlFor="register-company" className="form-label">
                    Название компании *
                  </label>
                  <div className="input-wrapper">
                    <input 
                      id="register-company"
                      type="text" 
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="ООО ПромСнаб"
                      disabled={isLoading}
                    />
                    <UserIcon className="input-icon" size={18} />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="auth-email" className="form-label">
                Email
              </label>
              <div className="input-wrapper">
                <input 
                  id="auth-email"
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@company.ru"
                  disabled={isLoading}
                />
                <Mail className="input-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="auth-password" className="form-label">
                  Пароль
                </label>
                {mode === 'login' && (
                  <a href="#" className="forgot-password-link" onClick={(e) => e.preventDefault()}>
                    Забыли пароль?
                  </a>
                )}
              </div>
              <div className="input-wrapper">
                <input 
                  id="auth-password"
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={mode === 'register' ? 6 : undefined}
                  disabled={isLoading}
                />
                <Lock className="input-icon" size={18} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="auth-submit-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  {mode === 'login' ? 'Вход...' : 'Регистрация...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Войти в кабинет' : 'Зарегистрироваться'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-mode-toggle">
            {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            <button 
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="auth-mode-link"
              disabled={isLoading}
            >
              {mode === 'login' ? 'Регистрация' : 'Вход'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
