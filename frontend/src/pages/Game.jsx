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
        <div className="min-h-screen  text-black bg-gray-50-50">
            {/* ===== Header ===== */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-700">
                <button
                    onClick={() => navigate(-1)}
                    className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-300 transition"
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
                            className="w-full h-full"
                            style={{ height: "70vh" }}
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
                <div className="bg-gray-100 rounded-xl p-4 h-fit">
                    <h2 className="text-lg font-semibold mb-2">
                        รายละเอียดเกม
                    </h2>

                    <p className="text-black leading-relaxed mb-4">
                        {game.description || "ไม่มีคำอธิบาย"}
                    </p>

                    <div className="text-sm text-gray-800">
                        👥 Players:{" "}
                        <span className="text-black font-medium">
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

                <div className="bg-gray-200 rounded-lg p-4">
                    <Leaderboard gameId={game.id} />
                </div>
            </div>
        </div>
    );
}

export default Game;
