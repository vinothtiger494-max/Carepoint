import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const SPECIALITIES = [
  'Cardiologist',
  'General Physician',
  'Dermatologist',
  'Orthopaedic',
  'Paediatrician',
  'Neurologist',
];

const STEPS = [
  { num: '1', title: 'Search', text: 'Find the right specialist by name or speciality.' },
  { num: '2', title: 'Book', text: 'Pick a date and an available time slot in seconds.' },
  { num: '3', title: 'Visit', text: 'Get reminders and manage your appointment online.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <span className="hero-badge">Trusted by thousands of patients</span>
          <h1>Your health, one click away</h1>
          <p>
            CarePoint connects you with experienced specialists. Search doctors,
            book appointments online, and manage every visit from one place.
          </p>
          <div className="hero-actions">
            <Link to="/doctors" className="btn btn-primary btn-lg">Find Doctors</Link>
            {!user && <Link to="/register" className="btn btn-outline btn-lg">Create Account</Link>}
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card hero-card-main">
            <div className="hero-doc">
              <div className="avatar avatar-lg">DR</div>
              <div>
                <strong>Dr. Anitha Kumar</strong>
                <p className="muted small">Cardiologist</p>
              </div>
            </div>
            <div className="hero-meta">
              <span className="badge badge-booked">Next: Tomorrow, 10:30 AM</span>
              <span className="muted small">Appointment confirmed</span>
            </div>
          </div>
          <div className="hero-card hero-card-float">
            <span className="hero-stat-num">50+</span>
            <span className="muted small">Specialist doctors</span>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="stats card">
        <div className="stat"><strong>6+</strong><span>Specialities</span></div>
        <div className="stat"><strong>10,000+</strong><span>Appointments booked</span></div>
        <div className="stat"><strong>24/7</strong><span>Online booking</span></div>
        <div className="stat"><strong>4.8</strong><span>Patient rating</span></div>
      </section>

      {/* Specialities */}
      <section className="landing-section">
        <h2>Browse by Speciality</h2>
        <p className="muted">Find the right doctor for your concern.</p>
        <div className="chip-row">
          {SPECIALITIES.map((s) => (
            <Link key={s} to={`/doctors?speciality=${encodeURIComponent(s)}`} className="chip">
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section">
        <h2>How CarePoint Works</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="card step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p className="muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-section">
        <div className="features">
          <div className="card feature">
            <div className="feature-icon">&#128269;</div>
            <h3>Find Specialists</h3>
            <p className="muted">Search by doctor name or speciality and compare fees.</p>
          </div>
          <div className="card feature">
            <div className="feature-icon">&#128197;</div>
            <h3>Book Instantly</h3>
            <p className="muted">Choose a date and an available time slot in seconds.</p>
          </div>
          <div className="card feature">
            <div className="feature-icon">&#128203;</div>
            <h3>Manage Visits</h3>
            <p className="muted">View, reschedule or cancel your appointments anytime.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta card">
        <div>
          <h2>Ready to book your appointment?</h2>
          <p className="muted">Join CarePoint and see a specialist today.</p>
        </div>
        <Link to={user ? '/doctors' : '/register'} className="btn btn-primary btn-lg">
          {user ? 'Find Doctors' : 'Get Started'}
        </Link>
      </section>
    </div>
  );
}
