import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { registrarJornada, obtenerJornadas } from "../services/jornadasService";
import ModuleActions from "../components/ModuleActions";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function Jornadas() {
    const { user, token, canWrite } = useAuth();

    const [puntos, setPuntos] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [jornadas, setJornadas] = useState([]);

    const [collectionPointId, setCollectionPointId] = useState("");
    const [eventDate, setEventDate] = useState(
        new Date().toISOString().slice(0, 16)
    );
    const [notes, setNotes] = useState("");

    const [details, setDetails] = useState([
        { material_id: "", weight_kg: "" }
    ]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    async function cargarDatos() {
        try {
            setLoading(true);
            setError("");

            const headers = {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            };

            const [puntosRes, materialesRes, jornadasData] =
                await Promise.all([
                    fetch(`${API_URL}/collection-points`, { headers }),
                    fetch(`${API_URL}/materials`, { headers }),
                    obtenerJornadas(token),
                ]);

            if (!puntosRes.ok || !materialesRes.ok) {
                throw new Error("No se pudieron consultar los catálogos");
            }

            const puntosData = await puntosRes.json();
            const materialesData = await materialesRes.json();

            setPuntos(puntosData.data.data || puntosData.data || []);
            setMateriales(materialesData.data.data || materialesData.data || []);
            setJornadas(jornadasData.data || []);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function agregarMaterial() {
        setDetails([
            ...details,
            { material_id: "", weight_kg: "" }
        ]);
    }

    function eliminarMaterial(index) {
        setDetails(details.filter((_, i) => i !== index));
    }

    function actualizarDetalle(index, campo, valor) {
        const nuevos = [...details];
        nuevos[index][campo] = valor;
        setDetails(nuevos);
    }

    async function guardarJornada(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        try {
            setSaving(true);

            const jornada = {
                collection_point_id: Number(collectionPointId),
                event_date: eventDate.replace("T", " ") + ":00",
                notes,
                details: details.map(item => ({
                    material_id: Number(item.material_id),
                    weight_kg: Number(item.weight_kg),
                })),
            };

            await registrarJornada(token, jornada);

            setSuccess("¡Jornada registrada correctamente!");

            setCollectionPointId("");
            setEventDate(new Date().toISOString().slice(0, 16));
            setNotes("");
            setDetails([{ material_id: "", weight_kg: "" }]);

            await cargarDatos();

        } catch (err) {
            const validationMessages = err.errors
                ? Object.values(err.errors).flat().join(" ")
                : err.message;

            setError(validationMessages);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="page-container">Cargando información...</div>;
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="text-start">
                        <h1>Jornadas de recolección</h1>
                        <p>
                            {canWrite
                                ? `Bienvenido, ${user?.name}. Registra los materiales recolectados.`
                                : "Consulta las jornadas y materiales recolectados."}
                        </p>
                    </div>

                    <ModuleActions />
                </div>
            </div>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {success && (
                <div className="alert alert-success">{success}</div>
            )}

            {canWrite && (
                <div className="eco-card mb-4">
                <h4 className="mb-4">Registrar nueva jornada</h4>

                <form onSubmit={guardarJornada}>

                    <div className="row">
                        <div className="col-md-6 form-group">
                            <label>Punto de recolección</label>

                            <select
                                className="form-control-eco"
                                value={collectionPointId}
                                onChange={e => setCollectionPointId(e.target.value)}
                                required
                            >
                                <option value="">Seleccionar punto</option>

                                {puntos.filter(p => p.status === 1).map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 form-group">
                            <label>Fecha de la jornada</label>

                            <input
                                type="datetime-local"
                                className="form-control-eco"
                                value={eventDate}
                                onChange={e => setEventDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5>Materiales recolectados</h5>

                        <button
                            type="button"
                            className="btn-outline-eco"
                            onClick={agregarMaterial}
                        >
                            + Agregar material
                        </button>
                    </div>

                    {details.map((detail, index) => (
                        <div className="row align-items-end mb-3" key={index}>

                            <div className="col-md-6 form-group">
                                <label>Material</label>

                                <select
                                    className="form-control-eco"
                                    value={detail.material_id}
                                    onChange={e =>
                                        actualizarDetalle(index, "material_id", e.target.value)
                                    }
                                    required
                                >
                                    <option value="">Seleccionar material</option>

                                    {materiales.filter(m => m.status === 1).map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-4 form-group">
                                <label>Peso en kilogramos</label>

                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    className="form-control-eco"
                                    placeholder="Ej. 25.50"
                                    value={detail.weight_kg}
                                    onChange={e =>
                                        actualizarDetalle(index, "weight_kg", e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="col-md-2 mb-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger w-100"
                                    disabled={details.length === 1}
                                    onClick={() => eliminarMaterial(index)}
                                >
                                    Eliminar
                                </button>
                            </div>

                        </div>
                    ))}

                    <div className="form-group mt-3">
                        <label>Observaciones</label>

                        <textarea
                            className="form-control-eco"
                            rows="3"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Observaciones de la jornada..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-eco"
                        disabled={saving}
                    >
                        {saving ? "Guardando..." : "Registrar jornada"}
                    </button>

                </form>
                </div>
            )}

            <div className="eco-card">
                <h4 className="mb-4">Jornadas registradas</h4>

                <div className="table-responsive">
                    <table className="eco-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Punto de recolección</th>
                                <th>Operador</th>
                                <th>Materiales</th>
                            </tr>
                        </thead>

                        <tbody>
                            {jornadas.map(j => (
                                <tr key={j.id}>
                                    <td>{j.id}</td>
                                    <td>{new Date(j.event_date).toLocaleString()}</td>
                                    <td>{j.collection_point?.name}</td>
                                    <td>{j.user?.name}</td>
                                    <td>{j.details?.length || 0}</td>
                                </tr>
                            ))}

                            {jornadas.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        No hay jornadas registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

export default Jornadas;
