import React from 'react';
export default function Trabajadoras({ irAHome }) {
    return (
        <div style={estilos.contenedor}>
            <h2>Registro de Trabajadoras y Horarios</h2>
            <p>Esta pantalla está vacía por ahora.</p>
            <button onClick={irAHome} style={estilos.btn}>Volver al Home</button>
        </div>
    );
}

const estilos = {
    contenedor: { padding: '40px', textAlign: 'center', fontFamily: 'Segoe UI' },
    btn: { marginTop: '20px', padding: '10px 20px', backgroundColor: '#e08238', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};