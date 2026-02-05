import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/useQuery';
import Navbar from '../components/Navbar';
import Container from '../components/ui/Container';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { SPACING, FONT_SIZE, COLORS, CONTAINER as CONTAINER_SIZES } from '../styles/tokens';

/**
 * Profile Page
 * 
 * Displays user profile information and statistics.
 * Requires user to be logged in (not guest).
 */
export default function Profile() {
    const { user, isGuest } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Redirect guests to login
        if (isGuest) {
            navigate('/login');
            return;
        }

        // TODO: Fetch user stats from API
        // For now, using mock data
        setTimeout(() => {
            setStats({
                gamesPlayed: 5,
                totalScore: 1250,
                highestScore: 500,
                averageScore: 250
            });
            setLoading(false);
        }, 500);
    }, [isGuest, navigate]);

    if (isGuest) {
        return null; // Will redirect
    }

    return (
        <div>
            <Navbar />
            <div style={{ padding: SPACING.lg, maxWidth: CONTAINER_SIZES.content, margin: '0 auto' }}>
                <div className="nes-container is-rounded">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
                        <h2 className="title" style={{ margin: 0 }}>Profile</h2>
                        <Button to="/" variant="default">
                            ← Back to Home
                        </Button>
                    </div>

                    {loading ? (
                        <LoadingSpinner message="Loading profile..." />
                    ) : (
                        <div>
                            <div style={{ marginBottom: SPACING.lg }}>
                                <h3 style={{ marginBottom: SPACING.sm }}>User Information</h3>
                                <p><strong>Username:</strong> {user?.username}</p>
                                <p style={{ fontSize: FONT_SIZE.sm, color: COLORS.textLight }}>Member since: {new Date().toLocaleDateString()}</p>
                            </div>

                            <div style={{ marginBottom: SPACING.lg }}>
                                <h3 style={{ marginBottom: SPACING.sm }}>Game Statistics</h3>
                                <p style={{ fontSize: FONT_SIZE.sm, color: COLORS.textLight, marginBottom: SPACING.md }}>
                                    Note: Statistics are currently mock data. Real stats will be available when backend integration is complete.
                                </p>
                                <div className="nes-container is-rounded" style={{ marginBottom: SPACING.sm }}>
                                    <p><strong>Games Played:</strong> {stats.gamesPlayed}</p>
                                </div>
                                <div className="nes-container is-rounded" style={{ marginBottom: SPACING.sm }}>
                                    <p><strong>Total Score:</strong> {stats.totalScore}</p>
                                </div>
                                <div className="nes-container is-rounded" style={{ marginBottom: SPACING.sm }}>
                                    <p><strong>Highest Score:</strong> {stats.highestScore}</p>
                                </div>
                                <div className="nes-container is-rounded">
                                    <p><strong>Average Score:</strong> {stats.averageScore}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
