import { useEffect, useState } from "react";
import { useScores } from '../services/useQuery';
import ax from '../services/ax';
import conf from '../services/conf';
import { COLORS, FONT_SIZE, SPACING } from '../styles/tokens';
import { LEADERBOARD_MAX_ITEMS } from '../constants/validation';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorMessage from './ui/ErrorMessage';

export default function Leaderboard({ gameId }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let ws;

        setLoading(true);
        setError(null);
        ax.get(conf.leaderboard(gameId))
            .then(res => {
                setData(res.data);
                setError(null);
            })
            .catch(() => {
                setError('Failed to load leaderboard');
            })
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

            ws = new WebSocket(wsUrl);
        } catch (e) {
            // WebSocket connection failed, using REST API only
            return () => { };
        }

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
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
                    return updated.sort((a, b) => b.score - a.score).slice(0, LEADERBOARD_MAX_ITEMS);
                });
            }
        };

        ws.onerror = () => {
            // WebSocket error, will continue using REST API
        };

        ws.onclose = () => {
            // WebSocket closed
        };

        return () => ws?.close();
    }, [gameId]);

    if (loading) {
        return <LoadingSpinner message="Loading Scores..." />;
    }

    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={() => {
                    setError(null);
                    setLoading(true);
                    ax.get(conf.leaderboard(gameId))
                        .then(res => setData(res.data))
                        .catch(err => setError('Failed to load leaderboard'))
                        .finally(() => setLoading(false));
                }}
            />
        );
    }

    if (data.length === 0) {
        return (
            <div style={{ padding: SPACING.lg, textAlign: 'center' }}>
                <p className="nes-text">No scores available for this game</p>
            </div>
        );
    }

    const rankLabel = (index) => `#${index + 1}`;

    const rankColor = (index) => {
        if (index === 0) return COLORS.gold;
        if (index === 1) return COLORS.silver;
        if (index === 2) return COLORS.bronze;
        return COLORS.textLighter;
    };

    return (
        <div style={{ padding: SPACING.md }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: FONT_SIZE.md }}>
                <tbody>
                    {data.map((row, index) => (
                        <tr
                            key={row.user_id}
                            style={{ borderBottom: '2px solid #ccc', padding: '1rem 0' }}
                        >
                            {/* Rank */}
                            <td style={{ padding: SPACING.sm, textAlign: 'center', fontWeight: 'bold', color: rankColor(index), fontSize: FONT_SIZE.lg }}>
                                {rankLabel(index)}
                            </td>

                            {/* Username */}
                            <td style={{ padding: SPACING.sm }}>
                                <span style={{ fontWeight: 'bold', fontSize: FONT_SIZE.md }}>
                                    {row.username}
                                </span>
                            </td>

                            {/* Score */}
                            <td style={{ padding: SPACING.sm, textAlign: 'right' }}>
                                <span style={{ fontFamily: "'Press Start 2P', cursive", fontWeight: 'bold', color: COLORS.gold, fontSize: FONT_SIZE.lg }}>
                                    {row.score}
                                </span>
                                <span style={{ marginLeft: SPACING.xs, fontSize: FONT_SIZE.sm, fontFamily: "'Press Start 2P', cursive" }}>
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
