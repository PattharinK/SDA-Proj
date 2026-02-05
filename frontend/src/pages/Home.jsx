import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useGames } from '../services/useQuery'; // ไม่ต้องใช้ useAuth แล้วเพราะย้ายไป Navbar
import Navbar from "../components/Navbar"; // นำเข้า Navbar

function Home() {
    const { games, loading, fetchGames } = useGames();

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    return (
        <div>
            {/* ใส่ Navbar ไว้ด้านบนสุด */}
            <Navbar />

            <div className="nes-container" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

                {/* ลบ Header เดิมออก และเหลือไว้แค่ส่วน Content */}

                <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', borderLeft: "4px solid black", paddingLeft: "10px" }}>
                    Available Games
                </h2>

                {loading && <p className="nes-text">Loading games...</p>}

                {!loading && games.length === 0 && <p className="nes-text">No games found</p>}

                <ul style={{ listStyle: "none", padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {games.map((game) => {
                        const slug = game.title
                            .replace(/\s+/g, "-")
                            .toLowerCase();

                        return (
                            <li
                                key={game.id}
                                className="nes-container is-rounded with-title"
                                style={{ padding: '2rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}
                            >
                                <p className="title" style={{ fontSize: '21px', padding: '0rem'}}>{game.title}</p>

                                <div style={{ marginBottom: '0.2rem', flexGrow: 1 }}>
                                    <p>Players: {game.player_count}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#666' }}>{game.description?.substring(0, 120)}</p>
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
