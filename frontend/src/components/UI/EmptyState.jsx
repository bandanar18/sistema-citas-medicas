import React from 'react';

const EmptyState = ({ message, action }) => (
  <div style={styles.container}>
    <p style={styles.message}>{message}</p>
    {action && (
      <button style={styles.btn} onClick={action.onClick}>
        {action.label}
      </button>
    )}
  </div>
);

const styles = {
  container: {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--gris-texto)',
  },
  message: {
    marginBottom: '15px',
    fontSize: '0.95rem',
  },
  btn: {
    color: 'var(--azul-mar)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    textDecoration: 'underline',
  },
};

export default EmptyState;
