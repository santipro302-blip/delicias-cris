const API_URL = 'http://localhost:5000/api';

// Obtener todos los productos desde SQL Server
export const obtenerProductos = async () => {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en el servicio obtenerProductos:', error);
        return [];
    }
};

// Función para iniciar sesión con la base de datos
export const iniciarSesionDB = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en el servicio de login:', error);
        return { success: false, message: 'No se pudo conectar con el servidor' };
    }
};

// Función para registrar un nuevo usuario en la base de datos
export const registrarUsuarioDB = async (email, password, rol) => {
    try {
        const response = await fetch(`${API_URL}/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, rol })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en el servicio de registro:', error);
        return { success: false, message: 'No se pudo conectar con el servidor' };
    }
};