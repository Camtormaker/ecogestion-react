
import {
    useEffect,
    useState
} from "react";

import api from "../services/api";
import AuthContext from "./AuthContextInstance";

const normalizeRoleName = (roleName) =>
    String(roleName || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );
    const [loading, setLoading] = useState(true);
    const roleName = normalizeRoleName(user?.role?.name || user?.role);
    const isAdministrator = [
        "admin",
        "administrador",
        "ecoadmin",
        "ecoadministrador",
    ].includes(roleName);
    const isOperator = [
        "operador",
        "operadordecampo",
        "ecooperador",
        "ecooperadordecampo",
    ].includes(roleName);
    // Comprobar si existe una sesión
    useEffect(() => {
        const verifySession = async () => {
            const savedToken = localStorage.getItem("token");

            if (!savedToken) {
                setLoading(false);
                return;
            }

            setToken(savedToken);

            try {
                const response = await api.get("/me");
                setUser(response.data.data);
            } catch {
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    // Iniciar sesión
    const login = async (email, password) => {
        const response = await api.post("/login", {
            email,
            password
        });

        const { user, token: newToken } = response.data.data;

        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(user);

        // Obtener usuario con su rol
        const meResponse = await api.get("/me");

        setUser(meResponse.data.data);

        return meResponse.data.data;
    };

    // Cerrar sesión
    const logout = async () => {
        try {
            await api.post("/logout");
        } finally {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                authenticated: !!user,
                canAccessReact: isAdministrator || isOperator,
                canWrite: isAdministrator || isOperator,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
