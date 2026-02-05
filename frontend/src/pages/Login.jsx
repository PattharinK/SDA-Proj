import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { SPACING, FONT_SIZE, CONTAINER, COLORS } from '../styles/tokens';
import { fullPageCenter, formField, inputStyle, fullWidthButton, textCenter, smallText } from '../styles/mixins';

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
        <div style={fullPageCenter}>
            <div className="nes-container is-rounded" style={{ maxWidth: CONTAINER.form, width: '100%' }}>
                <h2 className="title">Login</h2>

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
                    <button
                        type="submit"
                        disabled={loading}
                        className="nes-btn is-primary"
                        style={fullWidthButton}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <hr style={{ margin: `${SPACING.md} 0` }} />
                <p style={{ ...textCenter, ...smallText, marginBottom: SPACING.xs }}>Don't have an account?</p>
                <Link to="/register" className="nes-btn is-success" style={{ display: 'block', ...textCenter, ...fullWidthButton }}>
                    Register
                </Link>

                <hr style={{ margin: `${SPACING.md} 0` }} />
                <button
                    onClick={handleGuestLogin}
                    className="nes-btn"
                    style={{ ...fullWidthButton, backgroundColor: COLORS.gray }}
                >
                    ▶ Play As Guest
                </button>

            </div>
        </div>
    );
}

export default Login;
