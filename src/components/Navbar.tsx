import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User as UserIcon, Moon, Sun, GraduationCap } from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar glass">
      <div className="navbar-content container">
        <Link to="/" className="navbar-logo">
          <GraduationCap size={28} className="logo-icon" />
          Study<span>Hub</span>
        </Link>

        <div className="navbar-actions">
          <button className="nav-icon-btn" onClick={toggleTheme} title="Changer le thème">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="user-profile">
            <Link to="/profile" className="user-info-brief">
              <div className="navbar-avatar">
                {user?.pseudo?.[0] || <UserIcon size={16} />}
              </div>
              <span className="navbar-username">{user?.pseudo}</span>
            </Link>
            
            <button onClick={handleLogout} className="logout-btn" title="Déconnexion">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
