import { useEffect, useState } from "react";
import ax from "../services/ax";

export default function Leaderboard({ gameId }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        ax.get(`/api/scores/leaderboard/${gameId}`)
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, [gameId]);

    if (loading) {
        return (
            <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400">
                    ⏳ กำลังโหลดคะแนน...
                </td>
            </tr>
        );
    }

    if (data.length === 0) {
        return (
            <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400">
                    ยังไม่มีคะแนนในเกมนี้
                </td>
            </tr>
        );
    }

    const rankStyle = (index) => {
        if (index === 0) return "text-yellow-400 font-bold";
        if (index === 1) return "text-gray-300 font-semibold";
        if (index === 2) return "text-orange-400 font-semibold";
        return "text-gray-400";
    };

    const rankLabel = (index) => `#${index + 1}`;

    const rankClass = (index) => {
        if (index === 0) return "text-yellow-400 font-bold";
        if (index === 1) return "text-gray-300 font-semibold";
        if (index === 2) return "text-orange-400 font-semibold";
        return "text-gray-400";
    };

    return (
        <>
            {data.map((row, index) => (
                <tr
                    key={row.id ?? index}
                    className="group transition hover:bg-gray-700/40"
                >
                    {/* Rank */}
                    <td className={`px-4 py-3 text-center ${rankClass(index)}`}>
                        {rankLabel(index)}
                    </td>

                    {/* Username */}
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-200 group-hover:text-white">
                                {row.username}
                            </span>
                        </div>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3 text-right">
                        <span className="font-mono text-lg text-yellow-400">
                            {row.score}
                        </span>
                        <span className="ml-1 text-sm text-gray-400">
                            pts
                        </span>
                    </td>
                </tr>
            ))}
        </>
    );
}
