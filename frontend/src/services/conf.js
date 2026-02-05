import api from "./ax";

// API URL from environment variable (configurable per environment)
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const conf = {
    urlApi: `${API}/api`,

    // ระบบ Authentication
    login: `${API}/api/auth/login`,
    register: `${API}/api/auth/register`,
    logout: `${API}/api/auth/logout`,
    me: `${API}/api/auth/me`,

    // ระบบ Games
    games: `${API}/api/games/`,
    gameById: (gameId) => `${API}/api/games/${gameId}`,
    gameByTitle: (title) => `${API}/api/games/by-title/${title}`,
    playGame: (gameId) => `${API}/api/games/${gameId}/play`,

    // ระบบ Scores
    submitScore: `${API}/api/scores/submit`,
    leaderboard: (gameId) => `${API}/api/scores/leaderboard/${gameId}`,
};

export default conf;