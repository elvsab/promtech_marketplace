import React from 'react';
import { Phone, Mail, MapPin, Box } from 'lucide-react';
import '../styles/components/Footer.scss';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="grid">
          <div className="brand-section">
             <div className="brand">
                <Box size={24} className="brand-icon" />
                <span className="brand-name">PROMTECH</span>
              </div>
            <p className="brand-description">
              Ведущий поставщик промышленного оборудования на территории РФ. Комплексное оснащение предприятий, сервисное обслуживание и лизинг.
            </p>
          </div>

          <div className="links-section">
            <h4>Компания</h4>
            <ul>
              <li><a href="#">О нас</a></li>
              <li><a href="#">Новости</a></li>
              <li><a href="#">Сертификаты</a></li>
              <li><a href="#">Карьера</a></li>
            </ul>
          </div>

           <div className="links-section">
            <h4>Клиентам</h4>
            <ul>
              <li><a href="#">Доставка и оплата</a></li>
              <li><a href="#">Лизинг</a></li>
              <li><a href="#">Сервис и гарантия</a></li>
              <li><a href="#">Контакты</a></li>
            </ul>
          </div>

          <div className="contacts-section">
            <h4>Контакты</h4>
            <ul>
              <li>
                <Phone size={18} className="contact-icon" />
                <div className="contact-text">
                  <p className="contact-title">8 (800) 555-35-35</p>
                  <p className="contact-subtitle">Ежедневно 9:00 - 20:00</p>
                </div>
              </li>
              <li className="center">
                <Mail size={18} className="contact-icon" />
                <a href="mailto:info@promtech.ru" className="contact-text">info@promtech.ru</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 PromTech Marketplace. Все права защищены.</p>
          <div className="footer-links">
             <a href="#">Политика конфиденциальности</a>
             <a href="#">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
