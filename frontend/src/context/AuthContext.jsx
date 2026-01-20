import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // รอเช็ค Session ก่อนค่อยโชว์หน้าเว็บ

    // เช็ค Session เมื่อเข้าเว็บครั้งแรก (F5)
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await api.get('/me'); // ยิงไปเช็ค Backend
                setUser(data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (username, password) => {
        await api.post('/login', { username, password });
        // พอ Login ผ่าน ให้ดึงข้อมูล User มาเก็บ
        const { data } = await api.get('/me');
        setUser(data);
    };

    const logout = async () => {
        await api.post('/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);