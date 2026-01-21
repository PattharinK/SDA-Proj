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
        <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
            <h1>Game Portal</h1>

            {user && (
                <p>
                    Welcome, <strong>{user.username}</strong>
                </p>
            )}

            <button onClick={logout}>Logout</button>

            <hr style={{ margin: "20px 0" }} />

            <h2>Available Games</h2>

            {loading && <p>Loading games...</p>}

            {!loading && games.length === 0 && <p>No games found</p>}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {games.map((game) => {
                    const slug = game.title
                        .replace(/\s+/g, "-")
                        .toLowerCase();

                    return (
                        <li
                            key={game.id}
                            style={{
                                padding: 12,
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                marginBottom: 10,
                            }}
                        >
                            <h3>{game.title}</h3>
                            <p>Players: {game.player_count}</p>

                            <Link to={`/games/${slug}`}>
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
