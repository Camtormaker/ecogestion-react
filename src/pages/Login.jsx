import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, LockKeyhole, Mail } from "lucide-react";

import { useAuth } from "../context/useAuth";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(email, password);

            navigate("/jornadas", { replace: true });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "No fue posible iniciar sesión."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="text-center mb-4">
                    <div className="login-logo">
                        <Recycle size={42} />
                    </div>

                    <h2 className="fw-bold mt-3">
                        EcoGestión
                    </h2>

                    <p className="text-secondary">
                        Sistema de gestión de residuos reciclables
                    </p>
                </div>

                <h4 className="mb-2">
                    Bienvenido
                </h4>

                <p className="text-secondary mb-4">
                    Ingresa tus credenciales para continuar.
                </p>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                        <label className="form-label">
                            Correo electrónico
                        </label>

                        <div className="input-group">
                            <span className="input-group-text">
                                <Mail size={18} />
                            </span>

                            <input
                                type="email"
                                className="form-control"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">
                            Contraseña
                        </label>

                        <div className="input-group">
                            <span className="input-group-text">
                                <LockKeyhole size={18} />
                            </span>

                            <input
                                type="password"
                                className="form-control"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-success w-100 py-2"
                        disabled={loading}
                    >
                        {loading
                            ? "Iniciando sesión..."
                            : "Iniciar sesión"}
                    </button>

                </form>

                <div className="text-center mt-4">
                    <small className="text-secondary">
                        EcoGestión © 2026
                    </small>
                </div>

            </div>
        </div>
    );
}

export default Login;
