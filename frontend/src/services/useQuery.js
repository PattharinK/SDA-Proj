import useAuthStore from '../stores/authStore';
import useGamesStore from '../stores/gamesStore';
import useScoresStore from '../stores/scoresStore';

export const useAuth = () => useAuthStore();
export const useGames = () => useGamesStore();
export const useScores = () => useScoresStore();