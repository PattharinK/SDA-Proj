import { useEffect, useState } from "react";
import { useScores } from '../services/useQuery';
import ax from '../services/ax';
import conf from '../services/conf';

export default function Leaderboard({ gameId }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let ws;

        setLoading(true);
        ax.get(conf.leaderboard(gameId))
            .then(res => setData(res.data))
            .finally(() => setLoading(false));

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const apiUrl = new URL(conf.urlApi);
            const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl =
                `${wsProtocol}//${apiUrl.host}` +
                `/api/scores/ws/leaderboard/${gameId}` +
                `?token=${encodeURIComponent(token)}`;

            console.log("Connecting to WS:", wsUrl);
            ws = new WebSocket(wsUrl);
        } catch (e) {
            console.error('Failed to construct WebSocket URL', e);
            return () => { };
        }

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            console.log("WS message:", message);
            if (message.type === "initial") {
                setData(message.data);
            } else if (message.type === "update") {
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
                    return updated.sort((a, b) => b.score - a.score).slice(0, 10);
                });
            }
        };

        return () => ws?.close();
    }, [gameId]);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p className="nes-text">Loading Scores...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p className="nes-text">No scores available for this game</p>
            </div>
        );
    }

    const rankLabel = (index) => `#${index + 1}`;

    const rankColor = (index) => {
        if (index === 0) return '#FFD700'; // Gold
        if (index === 1) return '#C0C0C0'; // Silver
        if (index === 2) return '#CD7F32'; // Bronze
        return '#999';
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
                <tbody>
                    {data.map((row, index) => (
                        <tr
                            key={row.user_id}
                            style={{ borderBottom: '2px solid #ccc', padding: '1rem 0' }}
                        >
                            {/* Rank */}
                            <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: rankColor(index), fontSize: '18px' }}>
                                {rankLabel(index)}
                            </td>

                            {/* Username */}
                            <td style={{ padding: '1rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                    {row.username}
                                </span>
                            </td>

                            {/* Score */}
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <span style={{ fontFamily: "'Press Start 2P', cursive", fontWeight: 'bold', color: '#FFD700', fontSize: '18px' }}>
                                    {row.score}
                                </span>
                                <span style={{ marginLeft: '0.5rem', fontSize: '12px', fontFamily: "'Press Start 2P', cursive" }}>
                                    pts
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
