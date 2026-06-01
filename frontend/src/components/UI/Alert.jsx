import React from 'react';

const STYLES = {
  error: {
    backgroundColor: '#fdf2f2',
    border: '1px solid #f5c6cb',
    color: 'var(--rojo-error)',
  },
  success: {
    backgroundColor: '#f0faf0',
    border: '1px solid #c3e6cb',
    color: 'var(--verde-exito)',
  },
  warning: {
    backgroundColor: '#fffdf0',
    border: '1px solid #ffeeba',
    color: '#856404',
  },
};

const Alert = ({ type = 'error', message }) => {
  if (!message) return null;
  return (
    <div style={{ ...base, ...STYLES[type] }}>
      {message}
    </div>
  );
};

const base = {
  padding: '10px 15px',
  borderRadius: '5px',
  fontSize: '0.875rem',
  marginBottom: '15px',
};

export default Alert;
