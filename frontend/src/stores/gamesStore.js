import { create } from 'zustand';
import ax from '../services/ax';
import conf from '../services/conf';

const useGamesStore = create((set) => ({
    games: [],
    game: null,
    loading: false,

    fetchGames: async () => {
        set({ loading: true });
        try {
            const res = await ax.get(conf.games);
            set({ games: res.data });
        } catch (error) {
            console.error('Load games failed', error);
        } finally {
            set({ loading: false });
        }
    },

    fetchGame: async (slug) => {
        set({ loading: true });
        try {
            const res = await ax.get(conf.gameByTitle(slug));
            set({ game: res.data });
        } catch (error) {
            console.error('Game not found', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    playGame: async (id) => {
        try {
            await ax.post(conf.playGame(id));
        } catch (error) {
            console.error('Play game failed', error);
        }
    }
}));

export default useGamesStore;