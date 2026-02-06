import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { SPACING, COLORS } from '../styles/tokens';
import { textCenter, smallText } from '../styles/mixins';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import ErrorMessage from '../components/ui/ErrorMessage';

function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const loginAsGuest = useAuthStore((state) => state.loginAsGuest);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(form.username, form.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
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
            <h2 className="title">Login</h2>

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

                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    fullWidth
                >
                    Login
                </Button>
            </form>

            <hr style={{ margin: `${SPACING.md} 0` }} />
            <p style={{ ...textCenter, ...smallText, marginBottom: SPACING.xs }}>
                Don't have an account?
            </p>
            <Link to="/register" className="nes-btn is-success" style={{ display: 'block', ...textCenter, width: '100%', marginBottom: SPACING.md }}>
                Register
            </Link>

            <hr style={{ margin: `${SPACING.md} 0` }} />
            <Button
                onClick={handleGuestLogin}
                variant="default"
                fullWidth
                style={{ backgroundColor: COLORS.white, color: COLORS.black, display: 'block', ...textCenter, width: '100%', marginBottom: SPACING.md }}
      >
                ▶ Play As Guest
            </Button>
        </Container>
    );
}

export default Login;
