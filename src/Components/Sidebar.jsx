import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊', 
      path: '/dashboard',
      description: 'Visão geral do sistema'
    },
    { 
      id: 'users', 
      label: 'Usuários', 
      icon: '👥', 
      path: '/dashboard/users',
      description: 'Gerenciar usuários'
    },
    { 
      id: 'processos', 
      label: 'Processos', 
      icon: '🛠️', 
      path: '/dashboard/processos',
      description: 'Gerenciar processos'
    },
    { 
      id: 'Labor', 
      label: 'Planejamento',
      icon: '📈', 
      path: '/dashboard/labor-planning',
      description: 'Labor Plan'
    }
  ];

  const getActiveItem = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => item.path === currentPath);
    return activeItem?.id || 'dashboard';
  };

  const isActive = (itemId) => getActiveItem() === itemId;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">⚡</div>
          <div className="brand-text">
            <h3>Menu</h3>
            <p>Navegação</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            className={`sidebar-item ${isActive(item.id) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="item-content">
              <span className="sidebar-icon">{item.icon}</span>
              <div className="item-text">
                <span className="sidebar-label">{item.label}</span>
                {hoveredItem === item.id && (
                  <span className="item-description">{item.description}</span>
                )}
              </div>
            </div>
            {isActive(item.id) && <div className="active-indicator"></div>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-badge">
          <span className="badge-dot"></span>
          <span className="badge-text">Sistema Online</span>
        </div>
      </div>
    </aside>
  );
}