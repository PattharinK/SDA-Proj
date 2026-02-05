import { Link } from 'react-router-dom';
import { useAuth } from '../services/useQuery';
import { SPACING, FONT_SIZE, COLORS } from '../styles/tokens';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, isGuest, logout } = useAuth();

    return (
        <nav style={{
            borderBottom: `4px solid ${COLORS.black}`,
            padding: `${SPACING.sm} ${SPACING.lg}`,
            marginBottom: SPACING.lg,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: COLORS.white
        }}>
            {/* Logo / Brand */}
            <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>
                    <i className="nes-icon coin is-medium"></i> PSU888
                </h1>
            </Link>

            {/* User Info & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md, flexWrap: 'wrap' }}>
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* แสดงชื่อ User */}
                <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                    <span style={{ fontWeight: 'bold' }}>{user?.username || 'Guest'}</span>
                </div>

                {/* ปุ่ม Login/Register หรือ Logout */}
                {isGuest ? (
                    <div style={{ display: 'flex', gap: SPACING.sm, flexWrap: 'wrap' }}>
                        <Link to="/login" className="nes-btn is-primary">
                            Login
                        </Link>
                        <Link to="/register" className="nes-btn is-success">
                            Register
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: SPACING.sm, flexWrap: 'wrap' }}>
                        <Link to="/profile" className="nes-btn">
                            Profile
                        </Link>
                        <button onClick={logout} className="nes-btn is-error">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;