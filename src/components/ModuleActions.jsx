import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ModuleActions() {
    const { logout } = useAuth();

    return (
        <div className="module-actions">
            <nav className="module-navigation" aria-label="Navegación de módulos">
                <NavLink
                    to="/jornadas"
                    className={({ isActive }) =>
                        isActive ? "btn-eco" : "btn-outline-eco"
                    }
                >
                    Jornadas
                </NavLink>
                <NavLink
                    to="/entregas"
                    className={({ isActive }) =>
                        isActive ? "btn-eco" : "btn-outline-eco"
                    }
                >
                    Entregas
                </NavLink>
                <NavLink
                    to="/inventario"
                    className={({ isActive }) =>
                        isActive ? "btn-eco" : "btn-outline-eco"
                    }
                >
                    Inventario
                </NavLink>
            </nav>
            <button className="btn-outline-eco" onClick={logout}>
                Cerrar sesión
            </button>
        </div>
    );
}

export default ModuleActions;
