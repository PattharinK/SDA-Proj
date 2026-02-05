import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { SPACING, FONT_SIZE, CONTAINER, COLORS } from '../styles/tokens';
import { fullPageCenter, formField, inputStyle, fullWidthButton, textCenter, smallText } from '../styles/mixins';
import { PASSWORD_MIN_LENGTH } from '../constants/validation';

function Register() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }

    setLoading(true);

    try {
      await register(form.username, form.password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/');
  };

  return (
    <div style={fullPageCenter}>
      <div className="nes-container is-rounded" style={{ maxWidth: CONTAINER.form, width: '100%' }}>
        <h2 className="title">Register</h2>

        {error && (
          <div className="nes-container is-rounded is-error" style={{ marginBottom: SPACING.md }}>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="nes-field" style={formField}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="nes-input"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div className="nes-field" style={formField}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="nes-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div className="nes-field" style={formField}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="nes-input"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="nes-btn is-success"
            style={fullWidthButton}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <hr style={{ margin: `${SPACING.md} 0` }} />
        <p style={{ ...textCenter, ...smallText, marginBottom: SPACING.xs }}>Already have an account?</p>
        <Link to="/login" className="nes-btn is-primary" style={{ display: 'block', ...textCenter, ...fullWidthButton }}>
          Login
        </Link>

        <hr style={{ margin: `${SPACING.md} 0` }} />
        <button
          onClick={handleGuestLogin}
          className="nes-btn"
          style={{ display: 'block', ...textCenter, ...fullWidthButton, backgroundColor: COLORS.gray }}
        >
          ▶ Play As Guest
        </button>
      </div>
    </div>
  );
}

export default Register;
