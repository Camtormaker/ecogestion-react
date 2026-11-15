import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Jornadas from "./pages/Jornadas";
import Entregas from "./pages/Entregas";
import Inventario from "./pages/Inventario";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>

                    {/* Acceso público */}
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    {/* Módulo operativo protegido */}
                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/jornadas"
                            element={<Jornadas />}
                        />

                        <Route
                            path="/entregas"
                            element={<Entregas />}
                        />

                        <Route
                            path="/inventario"
                            element={<Inventario />}
                        />
                    </Route>

                    <Route
                        path="/"
                        element={<Navigate to="/jornadas" replace />}
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
