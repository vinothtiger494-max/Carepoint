import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';

export default function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState(['All']);
  const [search, setSearch] = useState('');
  const [speciality, setSpeciality] = useState(searchParams.get('speciality') || 'All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/doctors')
      .then(({ data }) => {
        setSpecialities(['All', ...new Set(data.map((d) => d.speciality))]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const sp = searchParams.get('speciality');
    if (sp && sp !== speciality) setSpeciality(sp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (speciality !== 'All') params.speciality = speciality;
    api.get('/doctors', { params })
      .then(({ data }) => setDoctors(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, speciality]);

  const handleSpeciality = (e) => {
    const value = e.target.value;
    setSpeciality(value);
    if (value === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ speciality: value });
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Find the Right Doctor</h1>
      <p className="muted page-sub">
        Search doctors by name or speciality and choose a doctor for your appointment.
      </p>

      <div className="filters card">
        <div className="search-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search doctor or speciality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search doctors"
          />
        </div>
        <select value={speciality} onChange={handleSpeciality} aria-label="Filter by speciality">
          {specialities.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Specialities' : s}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="page-loading">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="card empty-state">
          <h3>No doctors found</h3>
          <p className="muted">Try a different search term or speciality.</p>
        </div>
      ) : (
        <div className="doctor-grid">
          {doctors.map((d) => (
            <div className="card doctor-card" key={d._id}>
              <div className="avatar">DR</div>
              <h3>{d.name}</h3>
              <p className="speciality">{d.speciality}</p>
              <p className="muted">{d.experience} years experience</p>
              <p className="fee">Consultation fee: Rs. {d.fee}</p>
              <Link to={`/book/${d._id}`} className="btn btn-primary btn-block">
                Book Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
