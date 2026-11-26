import { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Doctors from './pages/Doctors.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import MyAppointments from './pages/MyAppointments.jsx';
import Admin from './pages/Admin.jsx';

function Logo() {
  return (
    <NavLink to="/" className="logo" aria-label="CarePoint home">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <rect x="1" y="1" width="22" height="22" rx="6" fill="#0F766E" />
          <path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      Care<span>Point</span>
    </NavLink>
  );
}

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Logo />
        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/doctors" onClick={close}>Find Doctors</NavLink>
          <NavLink to="/my-appointments" onClick={close}>My Appointments</NavLink>
          {isAdmin && <NavLink to="/admin" onClick={close}>Admin</NavLink>}
          {user ? (
            <button className="btn-link" onClick={handleLogout}>
              Logout{user.name ? ` (${user.name.split(' ')[0]})` : ''}
            </button>
          ) : (
            <NavLink to="/login" className="nav-login" onClick={close}>Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <Logo />
          <p className="muted small">Online hospital appointment booking, simplified.</p>
        </div>
        <div className="footer-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/doctors">Find Doctors</NavLink>
          <NavLink to="/my-appointments">My Appointments</NavLink>
          <NavLink to="/login">Login</NavLink>
        </div>
      </div>
      <p className="footer-copy">&copy; {new Date().getFullYear()} CarePoint. All rights reserved.</p>
    </footer>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route
            path="/book/:doctorId"
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
