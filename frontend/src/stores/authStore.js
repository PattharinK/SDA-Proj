import { create } from 'zustand';
import ax from '../services/ax';
import conf from '../services/conf';

const useAuthStore = create((set) => ({
    user: null,
    loading: true,

    login: async (username, password) => {
        try {
            const response = await ax.post(conf.login, { username, password });
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            const { data: userData } = await ax.get(conf.me);
            set({ user: userData });
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
        set({ user: null });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const { data } = await ax.get(conf.me);
                set({ user: data });
            } catch {
                localStorage.removeItem('token');
            }
        }
        set({ loading: false });
    }
}));

export default useAuthStore;