import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import ModuleActions from "../components/ModuleActions";
import { useAuth } from "../context/useAuth";

function Entregas() {
    const { canWrite } = useAuth();
    const [deliveries, setDeliveries] = useState([]);
    const [centers, setCenters] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        recycling_center_id: "",
        delivery_date: new Date().toISOString().slice(0, 10),
        notes: "",
        receipt: null,
        details: [
            { material_id: "", weight_kg: "" }
        ]
    });

    const loadData = useCallback(async () => {
        const [deliveryRes, centerRes, materialRes, inventoryRes] =
            await Promise.all([
                api.get("/deliveries"),
                api.get("/recycling-centers"),
                api.get("/materials"),
                api.get("/inventory")
            ]);

        return {
            deliveries: deliveryRes.data.data.data || deliveryRes.data.data,
            centers: centerRes.data.data.data || centerRes.data.data,
            materials: materialRes.data.data.data || materialRes.data.data,
            inventory: inventoryRes.data.data.data || inventoryRes.data.data,
        };
    }, []);

    const applyData = useCallback((data) => {
        setDeliveries(data.deliveries);
        setCenters(data.centers);
        setMaterials(data.materials);
        setInventory(data.inventory);
    }, []);

    useEffect(() => {
        let cancelled = false;

        loadData()
            .then((data) => {
                if (!cancelled) {
                    applyData(data);
                }
            })
            .catch((error) => {
                console.error(error);
                if (!cancelled) {
                    setMessage("Error al cargar la información.");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [applyData, loadData]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: name === "receipt" ? files[0] : value
        }));
    };

    const handleDetailChange = (index, field, value) => {
        const updated = [...form.details];

        updated[index] = {
            ...updated[index],
            [field]: value
        };

        setForm(prev => ({
            ...prev,
            details: updated
        }));
    };

    const addMaterial = () => {
        setForm(prev => ({
            ...prev,
            details: [
                ...prev.details,
                { material_id: "", weight_kg: "" }
            ]
        }));
    };

    const removeMaterial = (index) => {
        setForm(prev => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index)
        }));
    };

    const getAvailable = (materialId) => {
        const item = inventory.find(
            element => Number(element.material_id) === Number(materialId)
        );

        return Number(item?.available || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!form.recycling_center_id || !form.receipt) {
            setMessage("Selecciona un centro y adjunta el comprobante.");
            return;
        }

        if (form.details.some(
            detail => !detail.material_id ||
                !detail.weight_kg ||
                Number(detail.weight_kg) <= 0
        )) {
            setMessage("Completa correctamente todos los materiales y pesos.");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append("recycling_center_id", form.recycling_center_id);
            formData.append("delivery_date", form.delivery_date);
            formData.append("notes", form.notes || "");
            formData.append("receipt", form.receipt);

            form.details.forEach((detail, index) => {
                formData.append(
                    `details[${index}][material_id]`,
                    detail.material_id
                );

                formData.append(
                    `details[${index}][weight_kg]`,
                    detail.weight_kg
                );
            });

            const response = await api.post("/deliveries", formData);

            setMessage(response.data.message);

            setForm({
                recycling_center_id: "",
                delivery_date: new Date().toISOString().slice(0, 10),
                notes: "",
                receipt: null,
                details: [
                    { material_id: "", weight_kg: "" }
                ]
            });

            e.target.reset();

            applyData(await loadData());

        } catch (error) {
            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "No se pudo registrar la entrega."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="container py-5">Cargando entregas...</div>;
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="text-start">
                        <h1>Registro de entregas</h1>
                        <p className="text-secondary">
                            {canWrite
                                ? "Gestión de materiales entregados a centros de reciclaje."
                                : "Consulta del historial de materiales entregados a centros de reciclaje."}
                        </p>
                    </div>
                    <ModuleActions />
                </div>
            </div>

            {message && (
                <div className="alert alert-info">
                    {message}
                </div>
            )}

            {canWrite && (
                <div className="card shadow-sm mb-5">
                <div className="card-body">

                    <h4 className="mb-4">Nueva entrega</h4>

                    <form onSubmit={handleSubmit}>

                        <div className="row mb-3">

                            <div className="col-md-6">
                                <label className="form-label">
                                    Centro de reciclaje
                                </label>

                                <select
                                    className="form-select"
                                    name="recycling_center_id"
                                    value={form.recycling_center_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Seleccionar centro
                                    </option>

                                    {centers.map(center => (
                                        <option key={center.id} value={center.id}>
                                            {center.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">
                                    Fecha de entrega
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    name="delivery_date"
                                    value={form.delivery_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>

                        <hr />

                        <h5>Materiales entregados</h5>

                        {form.details.map((detail, index) => (
                            <div className="row mb-3" key={index}>

                                <div className="col-md-5">
                                    <label className="form-label">
                                        Material
                                    </label>

                                    <select
                                        className="form-select"
                                        value={detail.material_id}
                                        onChange={e =>
                                            handleDetailChange(
                                                index,
                                                "material_id",
                                                e.target.value
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Seleccionar material
                                        </option>

                                        {materials.map(material => (
                                            <option
                                                key={material.id}
                                                value={material.id}
                                                disabled={getAvailable(material.id) <= 0}
                                            >
                                                {material.name}
                                                {" - Disponible: "}
                                                {getAvailable(material.id)} kg
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Peso (kg)
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        min="0.01"
                                        step="0.01"
                                        value={detail.weight_kg}
                                        onChange={e =>
                                            handleDetailChange(
                                                index,
                                                "weight_kg",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    {detail.material_id && (
                                        <small className="text-secondary">
                                            Disponible: {getAvailable(detail.material_id)} kg
                                        </small>
                                    )}
                                </div>

                                <div className="col-md-3 d-flex align-items-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => removeMaterial(index)}
                                        disabled={form.details.length === 1}
                                    >
                                        Eliminar
                                    </button>
                                </div>

                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn btn-outline-success mb-4"
                            onClick={addMaterial}
                        >
                            + Agregar material
                        </button>

                        <div className="mb-3">
                            <label className="form-label">
                                Comprobante de entrega
                            </label>

                            <input
                                type="file"
                                className="form-control"
                                name="receipt"
                                accept="image/*,.pdf"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">
                                Observaciones
                            </label>

                            <textarea
                                className="form-control"
                                name="notes"
                                rows="3"
                                value={form.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={saving}
                        >
                            {saving ? "Registrando..." : "Registrar entrega"}
                        </button>

                    </form>

                </div>
                </div>
            )}

            <div className="card shadow-sm">
                <div className="card-body">

                    <h4 className="mb-3">Historial de entregas</h4>

                    <div className="table-responsive">
                        <table className="table table-striped table-hover">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Centro</th>
                                    <th>Fecha</th>
                                    <th>Materiales</th>
                                    <th>Comprobante</th>
                                </tr>
                            </thead>

                            <tbody>
                                {deliveries.map(delivery => (
                                    <tr key={delivery.id}>
                                        <td>{delivery.id}</td>

                                        <td>
                                            {delivery.recycling_center?.name || "N/D"}
                                        </td>

                                        <td>
                                            {new Date(
                                                delivery.delivery_date
                                            ).toLocaleDateString()}
                                        </td>

                                        <td>
                                            {delivery.details?.map(detail => (
                                                <div key={detail.id}>
                                                    {detail.material?.name}: {detail.weight_kg} kg
                                                </div>
                                            ))}
                                        </td>

                                        <td>
                                            {delivery.receipt_url ? (
                                                <span className="text-success">
                                                    Comprobante registrado
                                                </span>
                                            ) : "Sin comprobante"}
                                        </td>
                                    </tr>
                                ))}

                                {deliveries.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            No hay entregas registradas.
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

export default Entregas;
