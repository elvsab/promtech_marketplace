import React from 'react';
import { Box, Search, ShoppingCart, User, ArrowRight, Menu } from 'lucide-react';
import '../styles/components/DesignSystem.scss';

export const DesignSystemPage: React.FC = () => {
  const colors = [
    { name: 'prom-50', value: '#f8fafc' },
    { name: 'prom-100', value: '#f1f5f9' },
    { name: 'prom-200', value: '#e2e8f0' },
    { name: 'prom-300', value: '#cbd5e1' },
    { name: 'prom-400', value: '#94a3b8' },
    { name: 'prom-500', value: '#64748b' },
    { name: 'prom-600', value: '#475569' },
    { name: 'prom-700', value: '#334155' },
    { name: 'prom-800', value: '#1e293b' },
    { name: 'prom-900', value: '#0f172a' },
    { name: 'prom-orange', value: '#ea580c' },
  ];

  return (
    <div className="design-system">
      <div className="design-system-header">
        <h1>Design System / UI Kit</h1>
        <p>Визуальная спецификация стилей и компонентов проекта PromTech.</p>
      </div>

      {/* 1. Colors */}
      <section className="design-section">
        <h2 className="section-header">
          <span className="section-indicator"></span>
          Color Palette
        </h2>
        <div className="colors-grid">
          {colors.map((c) => (
            <div key={c.name} className="color-item">
              <div className="color-swatch" style={{ backgroundColor: c.value }}></div>
              <div>
                <p className="color-name">{c.name}</p>
                <p className="color-value">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography */}
      <section className="design-section">
        <h2 className="section-header">
          <span className="section-indicator"></span>
          Typography
        </h2>
        <div className="typography-section">
          <div className="typography-row">
            <div className="typography-label">Header 1</div>
            <div className="typography-example h1">Промышленное оборудование</div>
          </div>
          <div className="typography-row">
            <div className="typography-label">Header 2</div>
            <div className="typography-example h2">Категории товаров</div>
          </div>
          <div className="typography-row">
            <div className="typography-label">Header 3</div>
            <div className="typography-example h3">Токарный станок CNC-2000</div>
          </div>
          <div className="typography-row">
            <div className="typography-label">Body Text</div>
            <div className="typography-example body">
              Высокоточный токарный станок с ЧПУ для серийного производства деталей сложной формы. 
              Надежная станина и современная электроника обеспечивают долговечность и точность.
            </div>
          </div>
          <div className="typography-row">
            <div className="typography-label">Small / Caption</div>
            <div className="typography-example caption">
              В наличии • Артикул 12345
            </div>
          </div>
        </div>
      </section>

      {/* 3. Components */}
      <section className="design-section">
        <h2 className="section-header">
          <span className="section-indicator"></span>
          UI Components
        </h2>
        
        <div className="components-grid">
          
          {/* Buttons */}
          <div className="component-card">
            <h3 className="component-title">Buttons</h3>
            <div className="buttons-group">
              <button className="button-primary">
                Primary Action
              </button>
              <button className="button-secondary">
                Secondary Action
              </button>
              <button className="button-outline">
                Outline / Ghost
              </button>
            </div>
            <div className="buttons-group">
              <button className="button-icon">
                   <ShoppingCart size={20} />
              </button>
              <button className="button-icon-outline">
                   <Menu size={20} />
              </button>
              <a href="#" className="button-link">
                Read More <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Inputs */}
          <div className="component-card">
            <h3 className="component-title">Form Elements</h3>
            <div className="form-elements">
              <div className="search-input-example">
                <input 
                  type="text" 
                  placeholder="Search input..." 
                />
                <Search className="search-icon" size={18} />
              </div>
              
              <div className="checkbox-example">
                 <input type="checkbox" checked readOnly />
                 <label>Checkbox state checked</label>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="product-card-demo">
            <h3 className="component-title">Product Card Structure</h3>
            <div className="product-card-structure">
              <div className="product-card-preview">
                <div className="product-card">
                  <div className="image-container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>
                      <Box size={48} />
                    </div>
                    <div className="status-badge">
                      Badge
                    </div>
                  </div>
                  <div className="content">
                    <div style={{ height: '12px', width: '80px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '8px' }}></div>
                    <div style={{ height: '24px', width: '75%', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                      <div style={{ height: '12px', width: '100%', backgroundColor: '#f8fafc', borderRadius: '4px' }}></div>
                      <div style={{ height: '12px', width: '83%', backgroundColor: '#f8fafc', borderRadius: '4px' }}></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                       <div style={{ height: '24px', width: '96px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}></div>
                       <div style={{ height: '32px', width: '32px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-info">
                 <div className="info-item">
                    <p className="info-label">Card Container</p>
                    <p className="info-value">bg-white rounded-lg border border-prom-200 hover:shadow-lg</p>
                 </div>
                 <div className="info-item">
                    <p className="info-label">Typography</p>
                    <p className="info-value">Title: text-lg font-bold text-prom-900</p>
                    <p className="info-value">Desc: text-sm text-prom-600</p>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
