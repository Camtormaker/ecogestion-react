import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute() {
    const { authenticated, canAccessReact, loading } = useAuth();

    if (loading) {
        return (
            <div className="container text-center py-5">
                Verificando sesión...
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!canAccessReact) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
