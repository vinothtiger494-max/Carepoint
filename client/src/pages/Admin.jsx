import { useEffect, useState } from 'react';
import api from '../api/client.js';

const EMPTY_DOCTOR = { name: '', speciality: '', experience: '', fee: '' };

export default function Admin() {
  const [tab, setTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null); // doctor object or 'new' or null
  const [form, setForm] = useState(EMPTY_DOCTOR);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [docRes, apptRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/appointments'),
      ]);
      setDoctors(docRes.data);
      setAppointments(apptRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing('new');
    setForm(EMPTY_DOCTOR);
    setMessage('');
  };

  const openEdit = (d) => {
    setEditing(d._id);
    setForm({ name: d.name, speciality: d.speciality, experience: d.experience, fee: d.fee });
    setMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = {
        ...form,
        experience: Number(form.experience),
        fee: Number(form.fee),
      };
      if (editing === 'new') {
        await api.post('/doctors', payload);
        setMessage('Doctor added successfully.');
      } else {
        await api.put(`/doctors/${editing}`, payload);
        setMessage('Doctor updated successfully.');
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      setMessage('Doctor deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => setEditing(null);

  if (loading && doctors.length === 0) return <div className="page-loading">Loading admin panel...</div>;

  return (
    <div className="container">
      <h1 className="page-title">Admin Panel</h1>
      <p className="muted page-sub">Manage doctors and view all appointments.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="tabs">
        <button className={`tab ${tab === 'doctors' ? 'active' : ''}`} onClick={() => setTab('doctors')}>
          Doctors
        </button>
        <button className={`tab ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}>
          All Appointments
        </button>
      </div>

      {tab === 'doctors' && (
        <div className="card">
          <div className="row-between">
            <h3>Doctors</h3>
            {editing !== 'new' && (
              <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add Doctor</button>
            )}
          </div>

          {editing && (
            <form className="admin-form" onSubmit={handleSave}>
              <h4>{editing === 'new' ? 'Add Doctor' : 'Edit Doctor'}</h4>
              <div className="form-grid">
                <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input placeholder="Speciality" value={form.speciality} onChange={(e) => setForm({ ...form, speciality: e.target.value })} required />
                <input placeholder="Experience (years)" type="number" min="0" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required />
                <input placeholder="Fee (Rs.)" type="number" min="0" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} required />
              </div>
              <div className="row-gap">
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={cancelEdit}>Cancel</button>
              </div>
            </form>
          )}

          <div className="appt-table-wrap">
          <table className="appt-table">
            <thead>
              <tr><th>Name</th><th>Speciality</th><th>Experience</th><th>Fee</th><th></th></tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d._id}>
                  <td>{d.name}</td>
                  <td>{d.speciality}</td>
                  <td>{d.experience} yrs</td>
                  <td>Rs. {d.fee}</td>
                  <td className="row-gap">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === 'appointments' && (
        <div className="card">
          <h3>All Appointments</h3>
          {appointments.length === 0 ? (
            <p className="muted">No appointments yet.</p>
          ) : (
            <div className="appt-table-wrap">
            <table className="appt-table">
              <thead>
                <tr>
                  <th>Patient</th><th>Doctor</th><th>Speciality</th><th>Date</th><th>Slot</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.patient?.name}<br /><span className="muted small">{a.patient?.email}</span></td>
                    <td>{a.doctor?.name}</td>
                    <td>{a.doctor?.speciality}</td>
                    <td>{a.date}</td>
                    <td>{a.slot}</td>
                    <td><span className={`badge badge-${a.status === 'Booked' ? 'booked' : 'cancelled'}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
