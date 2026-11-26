import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

const ALL_SLOTS = ['09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM'];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get(`/doctors/${doctorId}`)
      .then(({ data }) => setDoctor(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (!date) {
      setBookedSlots([]);
      return;
    }
    setSlotsLoading(true);
    api.get(`/doctors/${doctorId}/slots`, { params: { date } })
      .then(({ data }) => setBookedSlots(data.slots))
      .catch((err) => setError(err.message))
      .finally(() => setSlotsLoading(false));
  }, [doctorId, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!date || !slot) {
      setError('Please select a date and a time slot');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/appointments', { doctorId, date, slot, reason });
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/my-appointments'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading doctor...</div>;
  if (!doctor) return <div className="container"><div className="alert alert-error">{error || 'Doctor not found'}</div></div>;

  return (
    <div className="container narrow">
      <h1 className="page-title">Book an Appointment</h1>
      <p className="muted page-sub">Select your doctor, preferred date and an available time slot.</p>

      <div className="card doctor-summary">
        <div className="avatar">DR</div>
        <div>
          <h3>{doctor.name}</h3>
          <p className="muted">{doctor.speciality} • {doctor.experience} years experience</p>
        </div>
        <div className="summary-fee">Fee: Rs. {doctor.fee}</div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="card form-card" onSubmit={handleSubmit}>
        <h3>Appointment Details</h3>

        <label>Select Date</label>
        <input type="date" min={today} value={date} onChange={(e) => { setDate(e.target.value); setSlot(''); }} required />

        <label>Reason for Visit</label>
        <input
          type="text"
          placeholder="Briefly describe your concern"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <label>Available Time Slots</label>
        {slotsLoading ? (
          <p className="muted">Checking availability...</p>
        ) : !date ? (
          <p className="muted">Select a date to see available slots.</p>
        ) : (
          <div className="slot-grid">
            {ALL_SLOTS.map((s) => {
              const booked = bookedSlots.includes(s);
              const selected = slot === s;
              return (
                <button
                  type="button"
                  key={s}
                  className={`slot-btn ${selected ? 'selected' : ''} ${booked ? 'booked' : ''}`}
                  disabled={booked}
                  onClick={() => setSlot(s)}
                >
                  {s}{booked ? ' (Booked)' : ''}
                </button>
              );
            })}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !slot}>
          {submitting ? 'Booking...' : 'CONFIRM BOOKING'}
        </button>
      </form>
    </div>
  );
}
