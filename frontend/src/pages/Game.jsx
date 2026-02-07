import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Leaderboard from "../components/Leaderboard";
import ResizableGameScreen from "../components/ResizableGameScreen";
import { useAuth, useGames } from '../services/useQuery';
import Navbar from "../components/Navbar";

function Game() {
    const { gameSlug } = useParams();
    const navigate = useNavigate();
    const { game, loading, fetchGame, playGame } = useGames();
    const { isGuest } = useAuth();
    const lastPlayedGameId = useRef(null);

    useEffect(() => {
        fetchGame(gameSlug).catch(() => navigate("/"));
    }, [gameSlug, fetchGame, navigate]);


    useEffect(() => {
        if (!game?.id || isGuest) return;

        if (lastPlayedGameId.current === game.id) return;

        lastPlayedGameId.current = game.id;
        playGame(game.id).catch(console.error);
    }, [game?.id, isGuest, playGame]);

    if (loading) {
        return <p className="text-center mt-10">Loading...</p>;
    }

    if (!game) return null;

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>

            {/* ใส่ Navbar */}
            <Navbar />

            {/* ===== Main Content ===== */}
            {/* เพิ่ม margin-top เล็กน้อยไม่ให้ติด Navbar เกินไป */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

                {/* Header ย่อย (ปุ่ม Back + ชื่อเกม) */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="nes-btn"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        &lt; BACK
                    </button>

                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
                        Playing: {game.title}
                    </h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

                    {/* ===== Left Col: Game Frame ===== */}
                    <div>
                        <ResizableGameScreen
                            gameSlug={gameSlug}
                            gameTitle={game.title}
                            gameId={game.id}
                            token={localStorage.getItem("token")}
                            isGuest={isGuest}
                        />

                        {/* Leaderboard ย้ายมาอยู่ใต้เกม (Optional: หรือจะไว้ที่เดิมก็ได้) */}
                        <div style={{ marginTop: '2rem' }}>
                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Leaderboard</h2>
                            <div className="nes-container is-rounded">
                                <Leaderboard gameId={game.id} />
                            </div>
                        </div>
                    </div>

                    {/* ===== Right Col: Game Info ===== */}
                    <div className="nes-container is-dark with-title" style={{ height: 'fit-content' }}>
                        <p className="title">Info</p>

                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ color: '#4cc' }}>Description:</span>
                            <p style={{ fontSize: '12px', marginTop: '0.5rem' }}>
                                {game.description || "No description available"}
                            </p>
                        </div>

                        <div style={{ fontSize: '12px' }}>
                            Players: <span style={{ color: '#f7d51d' }}>{game.player_count}</span>
                        </div>

                        {isGuest && (
                            <div style={{ marginTop: '1.5rem', padding: '0.5rem', border: '2px dashed white', borderRadius: '4px', fontSize: '10px', textAlign: 'center' }}>
                                Guest scores are not saved.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;
