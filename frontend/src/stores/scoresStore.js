import { create } from 'zustand';
import ax from '../services/ax';
import conf from '../services/conf';

const useScoresStore = create((set) => ({
    leaderboard: [],
    loading: false,

    fetchLeaderboard: async (gameId) => {
        set({ loading: true });
        try {
            const res = await ax.get(conf.leaderboard(gameId));
            set({ leaderboard: res.data });
        } catch (error) {
            console.error('Load leaderboard failed', error);
        } finally {
            set({ loading: false });
        }
    },

    submitScore: async (gameId, score) => {
        try {
            await ax.post(conf.submitScore, { game_id: gameId, score });
        } catch (error) {
            throw error;
        }
    }
}));

export default useScoresStore;