import { useParams, useNavigate } from "react-router-dom";

function Game() {
    const { gameSlug } = useParams();
    const navigate = useNavigate();

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

                <h1 className="text-xl font-semibold capitalize">
                    {gameSlug?.replace("-", " ")}
                </h1>
            </div>

            {/* ===== Game Frame ===== */}
            <div className="flex justify-center py-8">
                <div className="w-full max-w-5xl aspect-video border-4 border-gray-700 rounded-xl shadow-2xl overflow-hidden bg-black">
                    <iframe
                        src={`/games/${gameSlug}/index.html`}
                        title={gameSlug}
                        className="w-full h-full"
                    />
                </div>
            </div>

            {/* ===== Game Details ===== */}
            <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-lg font-semibold mb-2">
                    รายละเอียดเกม
                </h2>
                <p className="text-gray-300 leading-relaxed">
                    ...........................................................................................
                </p>
            </div>

            {/* ===== Leaderboard ===== */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                <h2 className="text-lg font-semibold mb-4">
                    Leaderboard
                </h2>

                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-2">อันดับ</th>
                                <th className="px-4 py-2">ผู้เล่น</th>
                                <th className="px-4 py-2">คะแนน</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3].map((rank) => (
                                <tr key={rank} className="border-t border-gray-700">
                                    <td className="px-4 py-2">{rank}</td>
                                    <td className="px-4 py-2">Player {rank}</td>
                                    <td className="px-4 py-2">{1000 - rank * 100}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Game;
