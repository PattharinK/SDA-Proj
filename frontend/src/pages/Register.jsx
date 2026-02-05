import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { SPACING, COLORS } from '../styles/tokens';
import { textCenter, smallText } from '../styles/mixins';
import { PASSWORD_MIN_LENGTH } from '../constants/validation';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import ErrorMessage from '../components/ui/ErrorMessage';

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
    <Container centered>
      <h2 className="title">Register</h2>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Username"
          id="username"
          placeholder="Enter your username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />

        <FormField
          label="Password"
          id="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <FormField
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
        />

        <Button
          type="submit"
          variant="success"
          loading={loading}
          fullWidth
        >
          Register
        </Button>
      </form>

      <hr style={{ margin: `${SPACING.md} 0` }} />
      <p style={{ ...textCenter, ...smallText, marginBottom: SPACING.xs }}>
        Already have an account?
      </p>
      <Link to="/login" className="nes-btn is-primary" style={{ display: 'block', ...textCenter, width: '100%', marginBottom: SPACING.md }}>
        Login
      </Link>

      <hr style={{ margin: `${SPACING.md} 0` }} />
      <Button
        onClick={handleGuestLogin}
        variant="default"
        fullWidth
        style={{ backgroundColor: COLORS.gray }}
      >
        ▶ Play As Guest
      </Button>
    </Container>
  );
}

export default Register;
