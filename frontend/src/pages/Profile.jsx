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
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Redirect guests to login
        if (isGuest) {
            navigate('/login');
            return;
        }

        // Fetch user profile from API
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setProfileData(data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
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
                    ) : error ? (
                        <div className="nes-container is-rounded is-dark" style={{ marginTop: SPACING.md }}>
                            <p>Error: {error}</p>
                        </div>
                    ) : (
                        <div>
                            <div style={{ marginBottom: SPACING.lg }}>
                                <h3 style={{ marginBottom: SPACING.sm }}>User Information</h3>
                                <p><strong>Username:</strong> {profileData?.username}</p>
                                <p style={{ fontSize: FONT_SIZE.sm, color: COLORS.textLight }}>
                                    Member since: {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </p>
                            </div>

                            <div style={{ marginBottom: SPACING.lg }}>
                                <h3 style={{ marginBottom: SPACING.sm }}>Game Scores</h3>
                                {profileData?.games && profileData.games.length > 0 ? (
                                    <div style={{ display: 'grid', gap: SPACING.md }}>
                                        {profileData.games.map((game) => (
                                            <div key={game.game_id} className="nes-container is-rounded" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: SPACING.md
                                            }}>
                                                {game.thumbnail_url && (
                                                    <img
                                                        src={game.thumbnail_url}
                                                        alt={game.game_title}
                                                        style={{
                                                            width: '64px',
                                                            height: '64px',
                                                            objectFit: 'cover',
                                                            imageRendering: 'pixelated'
                                                        }}
                                                    />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: 0, fontWeight: 'bold' }}>{game.game_title}</p>
                                                    <p style={{ margin: 0, fontSize: FONT_SIZE.sm, color: COLORS.textLight }}>
                                                        Best Score: <strong>{game.best_score}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="nes-container is-rounded" style={{ textAlign: 'center', padding: SPACING.lg }}>
                                        <p style={{ color: COLORS.textLight }}>ยังไม่มีคะแนนในเกม</p>
                                        <p style={{ fontSize: FONT_SIZE.sm, color: COLORS.textLight }}>
                                            ลองเล่นเกมแล้วทำคะแนนสักหน่อยสิ!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
