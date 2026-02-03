import { create } from 'zustand';
import ax from '../services/ax';
import conf from '../services/conf';

const useAuthStore = create((set) => ({
    user: null,
    isGuest: false,
    loading: true,

    loginAsGuest: () => {
        const guestId = `guest_${Date.now()}`;
        localStorage.setItem('guestId', guestId);
        set({ user: { username: 'Guest', id: guestId }, isGuest: true });
    },

    login: async (username, password) => {
        try {
            const response = await ax.post(conf.login, { username, password });
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.removeItem('guestId');
            const { data: userData } = await ax.get(conf.me);
            set({ user: userData, isGuest: false });
        } catch (error) {
            throw error;
        }
    },

    register: async (username, password) => {
        try {
            const { data } = await ax.post(conf.register, { username, password });
            return data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('guestId');
        set({ user: null, isGuest: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        const guestId = localStorage.getItem('guestId');

        if (token) {
            try {
                const { data } = await ax.get(conf.me);
                set({ user: data, isGuest: false, loading: false });
            } catch {
                localStorage.removeItem('token');
                set({ user: null, isGuest: false, loading: false });
            }
        } else if (guestId) {
            set({ user: { username: 'Guest', id: guestId }, isGuest: true, loading: false });
        } else {
            set({ loading: false });
        }
    }
}));

export default useAuthStore;