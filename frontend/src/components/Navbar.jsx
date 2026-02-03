import { Link } from 'react-router-dom';
import { useAuth } from '../services/useQuery';

const Navbar = () => {
    const { user, isGuest, logout } = useAuth();

    return (
        <nav style={{
            borderBottom: '4px solid #000',
            padding: '1rem 2rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fff'
        }}>
            {/* Logo / Brand */}
            <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>
                    <i className="nes-icon coin is-medium"></i> PSU888
                </h1>
            </Link>

            {/* User Info & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* แสดงชื่อ User */}
                <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                    <span style={{ fontWeight: 'bold' }}>{user?.username || 'Guest'}</span>
                </div>

                {/* ปุ่ม Login/Register หรือ Logout */}
                {isGuest ? (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/login" className="nes-btn is-primary">
                            Login
                        </Link>
                        <Link to="/register" className="nes-btn is-success">
                            Register
                        </Link>
                    </div>
                ) : (
                    <button onClick={logout} className="nes-btn is-error">
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;