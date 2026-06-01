import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import useDebounce from '../hooks/useDebounce';
import Spinner from '../components/UI/Spinner';

const formatDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

const Search = () => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const debouncedQuery          = useDebounce(query, 300);
  const navigate                = useNavigate();

  // Carga al montar (query vacío = todos los pacientes) y al buscar
  useEffect(() => {
    setLoading(true);
    client.get(`/patients/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => {
        setResults(res.data.results);
        setTotal(res.data.total);
      })
      .catch((err) => {
        if (err.networkError) console.warn(err.userMessage);
        setResults([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const isEmpty = !loading && results.length === 0;

  return (
    <div className="section-content">
      <h3 className="section-title">Buscar a un Paciente</h3>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por Nombre, Member ID, Teléfono o Correo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button
          className="btn-primary"
          style={{ width: 'auto' }}
          onClick={() => navigate('/patients/new')}
        >
          + Nuevo Paciente
        </button>
      </div>

      {/* Contador */}
      {!loading && (
        <p style={styles.counter}>
          {query
            ? `${total} resultado(s) para "${query}"`
            : `${total} paciente(s) registrado(s)`}
        </p>
      )}

      {/* Cargando */}
      {loading && (
        <div style={styles.center}>
          <Spinner size={28} />
        </div>
      )}

      {/* Sin resultados */}
      {isEmpty && (
        <div style={styles.emptyBox}>
          {query ? (
            <>
              <p style={{ marginBottom: '10px' }}>
                No se encontraron pacientes con <strong>"{query}"</strong>.
              </p>
              <button className="btn-link" onClick={() => navigate('/patients/new')}>
                + Registrar Paciente Nuevo
              </button>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '10px' }}>Aún no hay pacientes registrados.</p>
              <button className="btn-link" onClick={() => navigate('/patients/new')}>
                + Registrar el primer paciente
              </button>
            </>
          )}
        </div>
      )}

      {/* Tabla de resultados */}
      {!loading && results.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Member ID</th>
                <th>Fecha de Nacimiento</th>
                <th>Teléfono</th>
                <th>Estado / Ciudad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {results.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '600' }}>{p.full_name}</td>
                  <td style={{ color: 'var(--gris-texto)', fontSize: '0.875rem' }}>{p.member_id}</td>
                  <td>{formatDate(p.dob)}</td>
                  <td>{p.phone}</td>
                  <td>{p.state}, {p.city}</td>
                  <td>
                    <button className="btn-link" onClick={() => navigate(`/patients/${p.id}`)}>
                      Ver
                    </button>
                    <button className="btn-link" onClick={() => navigate(`/patients/${p.id}/edit`)}>
                      Editar
                    </button>
                    <button
                      className="btn-link"
                      onClick={() => navigate(`/appointments/new?patient_id=${p.id}&patient_name=${encodeURIComponent(p.full_name)}`)}
                    >
                      Agendar Cita
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  counter: {
    fontSize: '0.85rem',
    color: 'var(--gris-texto)',
    marginBottom: '10px',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px',
  },
  emptyBox: {
    background: 'var(--blanco)',
    borderRadius: '8px',
    padding: '35px',
    color: 'var(--gris-texto)',
    textAlign: 'center',
    fontSize: '0.95rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },
};

export default Search;
