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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    client.get(`/patients/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => {
        setResults(res.data.results);
        setSearched(true);
      })
      .catch(() => {
        setResults([]);
        setSearched(true);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="section-content">
      <h3 className="section-title">Buscar a un Paciente</h3>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por Nombre, Member ID, Teléfono o Correo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
            <Spinner size={20} />
          </div>
        )}
      </div>

      {/* Estado inicial */}
      {!searched && !loading && (
        <div style={styles.hint}>
          <p>Escribe el nombre, Member ID, teléfono o correo del paciente para buscarlo.</p>
        </div>
      )}

      {/* Sin resultados */}
      {searched && results.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={{ marginBottom: '10px' }}>
            No se encontraron pacientes con <strong>"{query}"</strong>.
          </p>
          <button className="btn-link" onClick={() => navigate('/patients/new')}>
            + Registrar Paciente Nuevo
          </button>
        </div>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <>
          <p style={styles.counter}>{results.length} resultado(s) encontrado(s)</p>
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
                    <td>{p.member_id}</td>
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
                      <button className="btn-link" onClick={() => navigate(`/appointments/new?patient_id=${p.id}&patient_name=${encodeURIComponent(p.full_name)}`)}>
                        Agendar Cita
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  hint: {
    background: 'var(--blanco)',
    borderRadius: '8px',
    padding: '30px',
    color: 'var(--gris-texto)',
    textAlign: 'center',
    fontSize: '0.95rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },
  emptyBox: {
    background: 'var(--blanco)',
    borderRadius: '8px',
    padding: '30px',
    color: 'var(--gris-texto)',
    textAlign: 'center',
    fontSize: '0.95rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },
  counter: {
    fontSize: '0.85rem',
    color: 'var(--gris-texto)',
    marginBottom: '10px',
  },
};

export default Search;
