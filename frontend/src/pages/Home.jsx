import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGames } from '../services/useQuery';
import Navbar from "../components/Navbar";
import { SPACING, FONT_SIZE, CONTAINER, COLORS } from '../styles/tokens';
import { GAME_CARD_MIN_WIDTH } from '../constants/validation';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import SearchBar from '../components/SearchBar';

function Home() {
    const { games, loading, fetchGames } = useGames();
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'players'

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

                <h2 style={{ fontSize: FONT_SIZE.xl, marginBottom: SPACING.md, borderLeft: "4px solid black", paddingLeft: "10px" }}>
                    Available Games
                </h2>

                {/* Search and Filter */}
                <div style={{ display: 'flex', gap: SPACING.md, marginBottom: SPACING.md, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search games..."
                        />
                    </div>
                    <div className="nes-select" style={{ minWidth: '150px' }}>
                        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
                            <option value="name">Sort by Name</option>
                            <option value="players">Sort by Players</option>
                        </select>
                    </div>
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
            </div>
        </div>
    );
}

export default Home;
