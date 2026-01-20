import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useAuth();

    // ถ้าไม่มี User ให้ Redirect ไปหน้า Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // ถ้ามี User ให้ปล่อยผ่านไป render ลูกหลาน (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;