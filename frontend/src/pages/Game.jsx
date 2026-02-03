import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Leaderboard from "../components/Leaderboard";
import { useAuth, useGames } from '../services/useQuery';

function Game() {
    const { gameSlug } = useParams();
    const navigate = useNavigate();
    const { game, loading, fetchGame, playGame } = useGames();

    useEffect(() => {
        fetchGame(gameSlug).catch(() => navigate("/"));
    }, [gameSlug, fetchGame, navigate]);

    useEffect(() => {
        if (!game) return;
        playGame(game.id);
    }, [game, playGame]);

    if (loading) {
        return <p className="text-center mt-10">Loading...</p>;
    }

    if (!game) return null;

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* ===== Header ===== */}
            <div className="nes-container" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="nes-btn"
                    style={{ fontSize: '12px' }}
                >
                    &lt; BACK
                </button>

                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
                    {game.title}
                </h1>
            </div>

            {/* ===== Main Content ===== */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>

                {/* ===== Game Frame ===== */}
                <div>
                    <div className="nes-container is-rounded" style={{ overflow: 'hidden', padding: 0 }}>
                        <iframe
                            src={`/games/${gameSlug}/index.html`}
                            title={game.title}
                            className="w-full h-full"
                            style={{ height: "70vh", border: 'none', width: '100%' }}
                            onLoad={(e) => {
                                e.target.contentWindow.postMessage(
                                    {
                                        type: "INIT_GAME",
                                        gameId: game.id,
                                        token: localStorage.getItem("token"),
                                    },
                                    "*"
                                );
                            }}
                        />

                    </div>
                </div>

                {/* ===== Game Info ===== */}
                <div className="nes-container is-rounded" style={{ padding: '1rem', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '1.1rem', marginTop: 0 }}>
                        Description
                    </h2>

                    <p style={{ fontSize: '12px', lineHeight: '1.5', marginBottom: '1rem' }}>
                        {game.description || "ไม่มีคำอธิบาย"}
                    </p>

                    <div style={{ fontSize: '12px' }}>
                        👥 Players:{" "}
                        <span style={{ fontWeight: 'bold' }}>
                            {game.player_count}
                        </span>
                    </div>
                </div>
            </div>

            {/* ===== Leaderboard ===== */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 2rem 1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                    Leaderboard
                </h2>

                <div className="nes-container is-rounded">
                    <Leaderboard gameId={game.id} />
                </div>
            </div>
        </div>
    );
}

export default Game;
