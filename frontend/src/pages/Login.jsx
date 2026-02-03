import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

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
        <div style={{ padding: '2rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="nes-container is-rounded" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="title">Login</h2>

                {error && (
                    <div className="nes-container is-rounded is-error" style={{ marginBottom: '1rem' }}>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="nes-field" style={{ marginBottom: '1rem' }}>
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="nes-input"
                            placeholder="Enter your username"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            style={{ fontSize: '12px' }}
                            required
                        />
                    </div>
                    <div className="nes-field" style={{ marginBottom: '1rem' }}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="nes-input"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            style={{ fontSize: '12px' }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="nes-btn is-primary"
                        style={{ width: '100%', marginBottom: '1rem' }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <hr style={{ margin: '1rem 0' }} />

                <button
                    onClick={handleGuestLogin}
                    className="nes-btn"
                    style={{ width: '100%', marginBottom: '1rem', backgroundColor: '#666' }}
                >
                    ▶ Play as Guest
                </button>

                <hr style={{ margin: '1rem 0' }} />

                <p style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '12px' }}>Don't have an account?</p>
                <Link to="/register" className="nes-btn is-success" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                    Register
                </Link>
            </div>
        </div>
    );
}

export default Login;