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
            const res = await ax.post(conf.playGame(id));
            const newPlayerCount = res.data.player_count;

            // Update both game and games in a single atomic operation
            set((state) => ({
                game: state.game?.id === id
                    ? { ...state.game, player_count: newPlayerCount }
                    : state.game,
                games: state.games.map((g) =>
                    Number(g.id) === Number(id)
                        ? { ...g, player_count: newPlayerCount }
                        : g
                ),
            }));

            return newPlayerCount;
        } catch (error) {
            console.error('Play game failed', error);
            throw error;
        }
    },
}));

export default useGamesStore;