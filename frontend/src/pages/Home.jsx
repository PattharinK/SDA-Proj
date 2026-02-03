import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, useGames } from '../services/useQuery';

function Home() {
    const { logout, user } = useAuth();
    const { games, loading, fetchGames } = useGames();

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    return (
        <div className="nes-container" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>PSU888</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user && <p style={{ margin: 0 }}>Welcome!, <strong>{user.username}</strong></p>}
                    <button onClick={logout} className="nes-btn is-error">Logout</button>
                </div>
            </div>

            <hr style={{ margin: "1.5rem 0" }} />

            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Available Games</h2>

            {loading && <p className="nes-text">Loading games...</p>}

            {!loading && games.length === 0 && <p className="nes-text">No games found</p>}

            <ul style={{ listStyle: "none", padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {games.map((game) => {
                    const slug = game.title
                        .replace(/\s+/g, "-")
                        .toLowerCase();

                    return (
                        <li
                            key={game.id}
                            className="nes-container is-rounded"
                            style={{
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>{game.title}</h3>
                            <p>Players: {game.player_count}</p>

                            <Link to={`/games/${slug}`} className="nes-btn is-primary" style={{ marginTop: 'auto', textAlign: 'center', display: 'block' }}>
                                Play
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default Home;
