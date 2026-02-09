import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGames } from '../services/useQuery';
import Navbar from "../components/Navbar";
import { SPACING, FONT_SIZE, CONTAINER, COLORS } from '../styles/tokens';
import { GAME_CARD_MIN_WIDTH } from '../constants/validation';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import RecentlyPlayed from '../components/RecentlyPlayed';
import { useSearch } from '../contexts/SearchContext';
import { GridIcon, ListIcon } from '../components/LayoutIcons';

function Home() {
    const { games, loading, fetchGames } = useGames();
    const [error, setError] = useState(null);
    const { searchQuery } = useSearch(); // Use search from context
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'players'
    const [layout, setLayout] = useState(() => {
        // Load layout preference from localStorage
        return localStorage.getItem('gamesLayout') || 'grid';
    });

    useEffect(() => {
        const loadGames = async () => {
            try {
                await fetchGames();
                setError(null);
            } catch (err) {
                setError('Failed to load games. Please try again.');
            }
        };
        loadGames();
    }, [fetchGames]);

    // Filter and sort games
    const filteredGames = games
        .filter(game =>
            game.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            return b.player_count - a.player_count;
        });

    return (
        <div>
            <Navbar />

            <div className="nes-container" style={{ padding: SPACING.lg, maxWidth: CONTAINER.content, margin: '0 auto' }}>

                {/* ลบ Header เดิมออก และเหลือไว้แค่ส่วน Content */}

                {/* Recently Played Section */}
                <RecentlyPlayed />

                <h2 style={{ fontSize: FONT_SIZE.xl, marginBottom: SPACING.md, borderLeft: "4px solid black", paddingLeft: "10px" }}>
                    Available Games
                </h2>

                {/* Sort and Layout Toggle */}
                <div style={{ display: 'flex', gap: 0, marginBottom: SPACING.md, alignItems: 'center' }}>
                    <div className="nes-select" style={{ minWidth: '150px', borderRight: 'none' }}>
                        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
                            <option value="name">Sort by Name</option>
                            <option value="players">Sort by Players</option>
                        </select>
                    </div>
                    <button
                        className="nes-btn"
                        onClick={() => {
                            const newLayout = layout === 'grid' ? 'list' : 'grid';
                            setLayout(newLayout);
                            localStorage.setItem('gamesLayout', newLayout);
                        }}
                        style={{
                            minWidth: '50px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 12px'
                        }}
                        title={layout === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
                    >
                        {layout === 'grid' ? <ListIcon /> : <GridIcon />}
                    </button>
                </div>

                {error && (
                    <ErrorMessage
                        message={error}
                        onRetry={() => {
                            setError(null);
                            fetchGames();
                        }}
                    />
                )}

                {loading && <LoadingSpinner message="Loading games..." />}

                {!loading && !error && filteredGames.length === 0 && searchQuery && (
                    <p className="nes-text">No games found matching "{searchQuery}"</p>
                )}

                {!loading && !error && games.length === 0 && !searchQuery && <p className="nes-text">No games found</p>}

                {/* Conditional Layout Rendering */}
                {layout === 'grid' ? (
                    // Grid View
                    <ul style={{ listStyle: "none", padding: 0, display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(${GAME_CARD_MIN_WIDTH}px, 100%), 1fr))`, gap: SPACING.md }}>
                        {filteredGames.map((game) => {
                            const slug = game.title
                                .replace(/\s+/g, "-")
                                .toLowerCase();

                            return (
                                <li
                                    key={game.id}
                                    className="nes-container is-rounded with-title"
                                    style={{ padding: `${SPACING.lg} ${SPACING.md} ${SPACING.md}`, display: 'flex', flexDirection: 'column', height: '100%' }}
                                >
                                    <p className="title" style={{ fontSize: '21px', padding: '0rem' }}>{game.title}</p>

                                    <div style={{ marginBottom: '0.2rem', flexGrow: 1 }}>
                                        <p>Players: {game.player_count}</p>
                                        <p style={{ fontSize: FONT_SIZE.sm, color: COLORS.textLight }}>{game.description?.substring(0, 120)}</p>
                                    </div>

                                    <Link to={`/games/${slug}`} className="nes-btn is-primary" style={{ textAlign: 'center', width: '100%' }}>
                                        Play Now
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    // List View
                    <ul style={{ listStyle: "none", padding: 0, display: 'flex', flexDirection: 'column', gap: SPACING.sm }}>
                        {filteredGames.map((game) => {
                            const slug = game.title
                                .replace(/\s+/g, "-")
                                .toLowerCase();

                            return (
                                <li
                                    key={game.id}
                                    className="nes-container is-rounded"
                                    style={{
                                        padding: SPACING.md,
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: SPACING.md,
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', minWidth: '150px' }}>
                                        {game.title}
                                    </div>

                                    <div style={{ flex: 1, minWidth: '200px', fontSize: FONT_SIZE.sm, color: COLORS.textLight }}>
                                        {game.description?.substring(0, 150) || 'No description available'}
                                    </div>

                                    <div style={{ fontSize: FONT_SIZE.sm, minWidth: '80px' }}>
                                        Players: <span style={{ fontWeight: 'bold' }}>{game.player_count}</span>
                                    </div>

                                    <Link to={`/games/${slug}`} className="nes-btn is-primary" style={{ minWidth: '100px' }}>
                                        Play Now
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Home;
