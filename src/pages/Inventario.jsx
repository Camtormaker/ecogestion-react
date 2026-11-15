import { useEffect, useState } from "react";
import api from "../services/api";
import ModuleActions from "../components/ModuleActions";

function Inventario() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Consultar inventario desde Laravel
    const loadInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/inventory");

            setMaterials(response.data.data);

        } catch (error) {
            console.error("Error al consultar inventario:", error);

            setError(
                error.response?.data?.message ||
                "No se pudo cargar el inventario."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    // Calcular totales generales
    const totalCollected = materials.reduce(
        (total, item) =>
            total + Number(item.total_collected),
        0
    );

    const totalDelivered = materials.reduce(
        (total, item) =>
            total + Number(item.total_delivered),
        0
    );

    const totalAvailable = materials.reduce(
        (total, item) =>
            total + Number(item.available),
        0
    );

    const formatWeight = (weight) =>
        Number(weight).toLocaleString("es-GT", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    if (loading) {
        return (
            <div className="container py-5">
                <p>Cargando inventario...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div className="text-start">
                    <h1 className="inventory-title">Inventario de materiales</h1>
                    <p className="text-secondary">
                        Control de materiales recolectados,
                        entregados y disponibles.
                    </p>
                </div>

                <div className="d-flex align-items-center justify-content-end flex-wrap gap-3">
                    <button
                        className="btn btn-success"
                        onClick={loadInventory}
                    >
                        Actualizar inventario
                    </button>
                    <ModuleActions />
                </div>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Indicadores generales */}
            <div className="row g-3 mb-4">

                <div className="col-md-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-secondary">
                                Total recolectado
                            </h6>
                            <h2 className="text-success">
                                {formatWeight(totalCollected)} kg
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-secondary">
                                Total entregado
                            </h6>
                            <h2 className="text-primary">
                                {formatWeight(totalDelivered)} kg
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-secondary">
                                Stock disponible
                            </h6>
                            <h2 className="text-warning">
                                {formatWeight(totalAvailable)} kg
                            </h2>
                        </div>
                    </div>
                </div>

            </div>

            {/* Tabla de inventario */}
            <div className="card shadow-sm">
                <div className="card-body">

                    <h5 className="mb-3">
                        Existencias por material
                    </h5>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">

                            <thead className="table-light">
                                <tr>
                                    <th>Material</th>
                                    <th>Categoría</th>
                                    <th>Recolectado</th>
                                    <th>Entregado</th>
                                    <th>Disponible</th>
                                </tr>
                            </thead>

                            <tbody>
                                {materials.length > 0 ? (
                                    materials.map((item) => (
                                        <tr key={item.material_id}>
                                            <td>
                                                <strong>
                                                    {item.material}
                                                </strong>
                                            </td>

                                            <td>
                                                {item.category}
                                            </td>

                                            <td>
                                                {formatWeight(
                                                    item.total_collected
                                                )} kg
                                            </td>

                                            <td>
                                                {formatWeight(
                                                    item.total_delivered
                                                )} kg
                                            </td>

                                            <td>
                                                <span className="badge bg-success">
                                                    {formatWeight(
                                                        item.available
                                                    )} kg
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center py-4"
                                        >
                                            No hay materiales registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Inventario;
