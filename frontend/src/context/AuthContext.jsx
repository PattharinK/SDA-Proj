import { createContext, useContext, useState, useEffect } from 'react';
import ax from '../services/ax';
import conf from '../services/conf';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // แก้ URL เป็น /auth/me
            ax.get(conf.me)
                .then(({ data }) => setUser(data))
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        // --- จุดที่แก้หลัก ---
        // 1. แก้ URL เป็น /auth/login
        // 2. ส่ง JSON ธรรมดา { username, password } ไม่ต้องใช้ URLSearchParams แล้ว
        // 3. ไม่ต้องกำหนด Header Content-Type เอง (Axios จัดการให้เป็น application/json อัตโนมัติ)
        const response = await ax.post(conf.login, {
            username,
            password
        });

        const { access_token } = response.data;
        localStorage.setItem('token', access_token);

        // แก้ URL เป็น /auth/me
        const { data: userData } = await ax.get(conf.me);
        setUser(userData);
    };

    const register = async (username, password) => {
        // แก้ URL เป็น /auth/register
        const { data } = await ax.post(conf.register, { username, password });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        ax.post(conf.logout);

    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);