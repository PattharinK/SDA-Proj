import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/useQuery';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* หน้าหลักคือ Home (ทุกคนเข้าได้ ทั้ง Guest และ User) */}
      <Route path="/" element={<Home />} />
      <Route path="/games/:gameSlug" element={<Game />} />

      {/* Login/Register สำหรับคนที่อยากสมัครสมาชิก */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;