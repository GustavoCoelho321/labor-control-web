import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Header.css"; // ← ADICIONE ESTA LINHA

export default function Header() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const userName = localStorage.getItem("userName") || "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.user-menu')) {
      setShowDropdown(false);
    }
  };

  // Corrigido: useEffect ao invés de useState
  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/DHL_Logo.svg/2560px-DHL_Logo.svg.png" 
            alt="DHL Logo" 
            className="header-logo"
          />
          <h1 className="header-title">Labor Control</h1>
        </div>
        
        <div className="header-right">
          <div 
            className="user-menu"
            onClick={toggleDropdown}
          >
            <div className="user-avatar">
              <span>{userInitial}</span>
            </div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">Administrador</span>
            </div>
            <svg 
              className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
            
            {showDropdown && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}