import React from 'react';

const TITLES = {
  '/':                 'Motor de Búsqueda',
  '/patients/new':     'Registrar Paciente Nuevo',
  '/patients':         'Detalle del Paciente',
  '/appointments/new': 'Agendar Cita Médica',
  '/reports':          'Reportes Diarios',
  '/history':          'Historial de Acciones',
};

const TopHeader = ({ pathname }) => {
  const title = Object.entries(TITLES).find(([key]) =>
    key === '/' ? pathname === '/' : pathname.startsWith(key)
  )?.[1] || 'Panel de Control';

  return (
    <header style={styles.header}>
      <h2 style={styles.title}>{title}</h2>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: 'var(--blanco)',
    padding: '20px 30px',
    borderBottom: '1px solid var(--gris-claro)',
  },
  title: {
    fontSize: '1.2rem',
    color: 'var(--negro)',
    fontWeight: '600',
  },
};

export default TopHeader;
