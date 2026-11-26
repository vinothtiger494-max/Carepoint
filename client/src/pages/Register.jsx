import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone || !form.password || !form.confirm) {
      return 'All fields are required';
    }
    if (!EMAIL_RE.test(form.email.trim())) return 'Enter a valid email address';
    if (!/^[0-9]{10}$/.test(form.phone)) return 'Phone number must be exactly 10 digits';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirm) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);
    setError('');
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
      });
      navigate('/doctors');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2>Create Account</h2>
        <p className="muted">Register as a new patient to book appointments.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input name="name" placeholder="Your full name" value={form.name} onChange={handleChange} />
          <label>Email Address</label>
          <input type="email" name="email" placeholder="name@example.com" value={form.email} onChange={handleChange} />
          <label>Phone Number</label>
          <input name="phone" placeholder="10-digit mobile number" maxLength={10} value={form.phone} onChange={handleChange} />
          <label>Password</label>
          <input type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
          <label>Confirm Password</label>
          <input type="password" name="confirm" placeholder="Re-enter password" value={form.confirm} onChange={handleChange} />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'REGISTER'}
          </button>
        </form>
        <p className="auth-footer muted">
          Already have an account? <Link to="/login" className="link-teal">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
