import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Motor de Búsqueda',        path: '/',                activeFor: ['/', '/patients/'] },
  { label: 'Registro de Pacientes',    path: '/patients/new',    activeFor: ['/patients/new']   },
  { label: 'Control de Citas Médicas', path: '/appointments/new',activeFor: ['/appointments/']  },
  { label: 'Reportes',                 path: '/reports',          activeFor: ['/reports']        },
  { label: 'Historial',                path: '/history',          activeFor: ['/history']        },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (item) => {
    const p = location.pathname;
    return item.activeFor.some((prefix) => {
      if (prefix === '/') return p === '/';
      // /patients/new debe ser exacto para no colisionar con /patients/:id
      if (prefix === '/patients/new') return p === '/patients/new';
      return p.startsWith(prefix);
    });
  };

  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.title}>Inicio del Sistema</h2>

      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            style={{
              ...styles.navBtn,
              ...(isActive(item) ? styles.navBtnActive : {}),
            }}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div style={styles.userInfo}>
        <p style={styles.userName}>{user?.full_name || 'Usuario Activo'}</p>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    backgroundColor: 'var(--blanco)',
    borderRight: '1px solid var(--gris-claro)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  title: {
    padding: '20px',
    color: 'var(--azul-mar)',
    textAlign: 'center',
    borderBottom: '1px solid var(--gris-claro)',
    fontSize: '1.1rem',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    flexGrow: 1,
  },
  navBtn: {
    background: 'none',
    border: 'none',
    borderLeft: '4px solid transparent',
    padding: '15px 20px',
    textAlign: 'left',
    fontSize: '0.95rem',
    cursor: 'pointer',
    color: 'var(--gris-texto)',
    transition: 'all 0.2s',
  },
  navBtnActive: {
    backgroundColor: 'var(--blanco-fondo)',
    color: 'var(--azul-mar)',
    borderLeft: '4px solid var(--azul-mar)',
    fontWeight: 'bold',
  },
  userInfo: {
    padding: '20px',
    borderTop: '1px solid var(--gris-claro)',
    textAlign: 'center',
  },
  userName: {
    marginBottom: '10px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: 'var(--negro)',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: 'var(--negro)',
    border: '1px solid var(--gris-claro)',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '0.9rem',
  },
};

export default Sidebar;
