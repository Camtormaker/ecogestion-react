const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function obtenerJornadas(token) {
    const response = await fetch(`${API_URL}/collection-events`, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Error al consultar jornadas");
    }

    return data.data;
}

export async function registrarJornada(token, jornada) {
    const response = await fetch(`${API_URL}/collection-events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jornada),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || "Error al registrar jornada");
        error.errors = data.errors;
        throw error;
    }

    return data;
}
