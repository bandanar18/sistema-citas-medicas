import React from 'react';

const getTitle = (pathname) => {
  if (pathname === '/')                                   return 'Motor de Búsqueda';
  if (pathname === '/patients/new')                      return 'Registrar Paciente Nuevo';
  if (/^\/patients\/\d+\/edit$/.test(pathname))         return 'Editar Paciente';
  if (/^\/patients\/\d+$/.test(pathname))               return 'Detalle del Paciente';
  if (pathname.startsWith('/appointments'))              return 'Agendar Cita Médica';
  if (pathname.startsWith('/reports'))                   return 'Reportes Diarios';
  if (pathname.startsWith('/history'))                   return 'Historial de Acciones';
  return 'Panel de Control';
};

const TopHeader = ({ pathname }) => (
  <header style={styles.header}>
    <h2 style={styles.title}>{getTitle(pathname)}</h2>
  </header>
);

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
