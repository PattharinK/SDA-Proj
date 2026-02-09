import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecentGames } from '../utils/recentGames';
import { SPACING } from '../styles/tokens';

function RecentlyPlayed() {
    const [recentGames, setRecentGames] = useState([]);

    useEffect(() => {
        // Load recent games from localStorage
        const games = getRecentGames();
        setRecentGames(games);
    }, []);

    // Don't render if no recent games
    if (recentGames.length === 0) {
        return null;
    }

    return (
        <div style={{ marginBottom: SPACING.xl }}>
            <h3 style={{
                fontSize: '1.2rem',
                marginBottom: SPACING.md,
                borderLeft: '4px solid #209cee',
                paddingLeft: '10px'
            }}>
                Recently Played
            </h3>

            <div style={{
                display: 'flex',
                gap: SPACING.md,
                overflowX: 'auto',
                paddingBottom: SPACING.sm,
                paddingTop: '8px', // Prevent border clipping on hover
                scrollbarWidth: 'thin',
                marginTop: SPACING.md
            }}>
                {recentGames.map((game) => (
                    <Link
                        key={game.id}
                        to={`/games/${game.slug}`}
                        style={{ textDecoration: 'none', minWidth: '200px' }}
                    >
                        <div
                            className="nes-container is-rounded"
                            style={{
                                padding: SPACING.md,
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {game.thumbnail && (
                                <img
                                    src={game.thumbnail}
                                    alt={game.title}
                                    style={{
                                        width: '100%',
                                        height: '100px',
                                        objectFit: 'cover',
                                        marginBottom: SPACING.sm,
                                        imageRendering: 'pixelated'
                                    }}
                                />
                            )}

                            <p style={{
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                marginBottom: SPACING.xs,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {game.title}
                            </p>

                            <p style={{
                                fontSize: '0.7rem',
                                color: '#666',
                                margin: 0
                            }}>
                                Last played: {new Date(game.playedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default RecentlyPlayed;
