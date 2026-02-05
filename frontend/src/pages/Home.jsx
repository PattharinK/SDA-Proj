import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useGames } from '../services/useQuery';
import Navbar from "../components/Navbar";
import { SPACING, FONT_SIZE, CONTAINER, COLORS } from '../styles/tokens';
import { GAME_CARD_MIN_WIDTH } from '../constants/validation';

function Home() {
    const { games, loading, fetchGames } = useGames();

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    return (
        <div>
            <Navbar />

            <div className="nes-container" style={{ padding: SPACING.lg, maxWidth: CONTAINER.content, margin: '0 auto' }}>

                {/* ลบ Header เดิมออก และเหลือไว้แค่ส่วน Content */}

                <h2 style={{ fontSize: FONT_SIZE.xl, marginBottom: SPACING.md, borderLeft: "4px solid black", paddingLeft: "10px" }}>
                    Available Games
                </h2>

                {loading && <p className="nes-text">Loading games...</p>}

                {!loading && games.length === 0 && <p className="nes-text">No games found</p>}

                <ul style={{ listStyle: "none", padding: 0, display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${GAME_CARD_MIN_WIDTH}px, 1fr))`, gap: SPACING.md }}>
                    {games.map((game) => {
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
