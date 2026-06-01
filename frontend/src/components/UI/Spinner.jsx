import React from 'react';

const Spinner = ({ size = 24 }) => (
  <div style={{
    width: size,
    height: size,
    border: `3px solid var(--gris-claro)`,
    borderTop: `3px solid var(--azul-mar)`,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  }} />
);

export default Spinner;
