import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.view}>
      <div style={styles.container}>
        <h1 style={styles.brandTitle}>Ingreso al Sistema</h1>
        <p style={styles.subtitle}>Sistema de Control de Agendas de Citas Médicas</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              style={styles.input}
              required
              autoFocus
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.btnPrimary} disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  view: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--blanco-fondo)',
  },
  container: {
    backgroundColor: 'var(--blanco)',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  brandTitle: {
    color: 'var(--azul-mar)',
    marginBottom: '5px',
    fontSize: '1.5rem',
  },
  subtitle: {
    color: 'var(--gris-texto)',
    marginBottom: '25px',
    fontSize: '0.9rem',
  },
  formGroup: {
    marginBottom: '15px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid var(--gris-claro)',
    borderRadius: '5px',
    outline: 'none',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  error: {
    color: 'var(--rojo-error)',
    fontSize: '0.875rem',
    marginBottom: '15px',
    textAlign: 'left',
    backgroundColor: '#fdf2f2',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #f5c6cb',
  },
  btnPrimary: {
    backgroundColor: 'var(--azul-mar)',
    color: 'var(--blanco)',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    fontSize: '1rem',
    transition: 'background 0.3s',
  },
};

export default Login;
