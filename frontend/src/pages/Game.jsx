import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Leaderboard from "../components/Leaderboard";
import ax from "../services/ax";

function Game() {
    const { gameSlug } = useParams();
    const navigate = useNavigate();

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGame = async () => {
            try {
                const res = await ax.get(`/games/by-title/${gameSlug}`);
                setGame(res.data);
            } catch (err) {
                console.error("Game not found", err);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        loadGame();
    }, [gameSlug, navigate]);

    useEffect(() => {
        if (!game) return;

        ax.post(`/games/${game.id}/play`).catch((err) =>
            console.error("Play game failed", err)
        );
    }, [game]);

    if (loading) {
        return <p className="text-center mt-10">Loading...</p>;
    }

    if (!game) return null;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* ===== Header ===== */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-700">
                <button
                    onClick={() => navigate(-1)}
                    className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition"
                >
                    ← กลับ
                </button>

                <h1 className="text-xl font-semibold">
                    {game.title}
                </h1>
            </div>

            {/* ===== Main Content ===== */}
            <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* ===== Game Frame ===== */}
                <div className="lg:col-span-3">
                    <div className="w-full bg-black border-4 border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                        <iframe
                            src={`/games/${gameSlug}/index.html`}
                            title={game.title}
                            className="w-full"
                            style={{
                                height: "70vh",
                                minHeight: "400px",
                            }}
                        />
                    </div>
                </div>

                {/* ===== Game Info ===== */}
                <div className="bg-gray-800 rounded-xl p-4 h-fit">
                    <h2 className="text-lg font-semibold mb-2">
                        รายละเอียดเกม
                    </h2>

                    <p className="text-gray-300 leading-relaxed mb-4">
                        {game.description || "ไม่มีคำอธิบาย"}
                    </p>

                    <div className="text-sm text-gray-400">
                        👥 Players:{" "}
                        <span className="text-white font-medium">
                            {game.player_count}
                        </span>
                    </div>
                </div>
            </div>

            {/* ===== Leaderboard ===== */}
            <div className="max-w-6xl mx-auto px-6 pb-12">
                <h2 className="text-lg font-semibold mb-4">
                    Leaderboard
                </h2>

                <div className="bg-gray-800 rounded-lg p-4">
                    <Leaderboard gameId={game.id} />
                </div>
            </div>
        </div>
    );
}

export default Game;
