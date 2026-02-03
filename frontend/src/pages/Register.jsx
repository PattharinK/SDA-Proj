import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

function Register() {
    const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const register = useAuthStore((state) => state.register);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
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

    return (
        <div style={{ padding: '2rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="nes-container is-rounded" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="title">Register</h2>

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
                    <div className="nes-field" style={{ marginBottom: '1rem' }}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="nes-input"
                            placeholder="Confirm your password"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            style={{ fontSize: '12px' }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="nes-btn is-success"
                        style={{ width: '100%', marginBottom: '1rem' }}
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <hr style={{ margin: '1rem 0' }} />

                <p style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Already have an account?</p>
                <Link to="/login" className="nes-btn is-primary" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                    Login
                </Link>
            </div>
        </div>
    );
}

export default Register;