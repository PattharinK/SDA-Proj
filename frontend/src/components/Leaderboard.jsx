import { useEffect, useState } from "react";
import { useScores } from '../services/useQuery';
import ax from '../services/ax';
import conf from '../services/conf';

export default function Leaderboard({ gameId }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // โหลดข้อมูลเริ่มต้น
        setLoading(true);
        ax.get(conf.leaderboard(gameId))
            .then(res => setData(res.data))
            .finally(() => setLoading(false));

        // เชื่อม WebSocket สำหรับรับข่าวอัปเดตแบบ Real-time
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/scores/ws/leaderboard/${gameId}`;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            if (message.type === "initial") {
                // ข้อมูลเริ่มต้นจาก WebSocket
                setData(message.data);
            } else if (message.type === "update") {
                // อัปเดตคะแนนใหม่
                setData(prev => {
                    const updated = [...prev];
                    const index = updated.findIndex(p => p.user_id === message.data.user_id);
                    
                    if (index !== -1) {
                        updated[index] = { ...updated[index], score: message.data.score };
                    } else {
                        updated.push({
                            username: message.data.username,
                            score: message.data.score,
                            user_id: message.data.user_id
                        });
                    }
                    
                    // เรียงลำดับใหม่
                    return updated.sort((a, b) => b.score - a.score).slice(0, 10);
                });
            }
        };

        return () => ws.close();
    }, [gameId]);

    if (loading) {
        return (
            <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400">
                    กำลังโหลดคะแนน...
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
        if (index === 0) return "text-yellow-500 font-bold";
        if (index === 1) return "text-gray-600 font-semibold";
        if (index === 2) return "text-orange-800 font-semibold";
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
                            <span className="font-medium text-black group-hover:text-white">
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
