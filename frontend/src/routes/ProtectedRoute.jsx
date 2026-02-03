import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../services/useQuery';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    // ถ้าไม่มี User และไม่ใช่ Guest ให้ Redirect ไปหน้า Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // ถ้ามี User หรือ Guest ให้ปล่อยผ่าน
    return <Outlet />;
};

export default ProtectedRoute;