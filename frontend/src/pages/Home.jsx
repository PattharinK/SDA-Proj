import React from 'react';
import { useAuth } from '../context/AuthContext';

function Home() {
    const { logout, user } = useAuth();

    // สร้างฟังก์ชันสำหรับกดปุ่ม (เผื่อต้องการเพิ่ม Logic การ redirect)
    const handleLogout = () => {
        logout();
        // ถ้าใช้ react-router-dom อาจจะเพิ่ม: navigate('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Home Page</h1>

            {user && <p>Welcome, <strong>{user.username}</strong></p>}

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Home;