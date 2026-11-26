import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cancelling, setCancelling] = useState(null);

  const fetchAppointments = () => {
    api.get('/appointments/my')
      .then(({ data }) => setAppointments(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setCancelling(id);
    setError('');
    setMessage('');
    try {
      await api.put(`/appointments/${id}/cancel`);
      setMessage('Appointment cancelled.');
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">My Appointments</h1>
      <p className="muted page-sub">View and manage your booked appointments.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {loading ? (
        <div className="page-loading">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="card empty-state">
          No appointments yet. <a href="/doctors" className="link-teal">Find a doctor</a> to book one.
        </div>
      ) : (
        <>
          <div className="appt-table-wrap card">
            <table className="appt-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Speciality</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.doctor?.name}</td>
                    <td>{a.doctor?.speciality}</td>
                    <td>{a.date}</td>
                    <td>{a.slot}</td>
                    <td><span className={`badge badge-${a.status === 'Booked' ? 'booked' : 'cancelled'}`}>{a.status}</span></td>
                    <td>
                      {a.status === 'Booked' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(a._id)}
                          disabled={cancelling === a._id}
                        >
                          {cancelling === a._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="appt-cards">
            {appointments.map((a) => (
              <div className="card appt-card" key={a._id}>
                <div className="appt-card-head">
                  <strong>{a.doctor?.name}</strong>
                  <span className={`badge badge-${a.status === 'Booked' ? 'booked' : 'cancelled'}`}>{a.status}</span>
                </div>
                <p className="muted">{a.doctor?.speciality} • {a.date} • {a.slot}</p>
                {a.reason && <p className="muted small">Reason: {a.reason}</p>}
                {a.status === 'Booked' && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancel(a._id)}
                    disabled={cancelling === a._id}
                  >
                    {cancelling === a._id ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
