import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'users', label: 'Usuários', icon: '👥', path: '/dashboard/users' },
    { id: 'processos', label: 'Gerenciamento de Processos', icon: '🛠️', path: '/dashboard/processos' },
    { id: 'scheduling', label: 'Scheduling', icon: '📈', path: '/dashboard/scheduling' }
  ];

  // Determina qual item está ativo baseado na URL
  const getActiveItem = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => item.path === currentPath);
    return activeItem?.id || 'dashboard';
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${getActiveItem() === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}