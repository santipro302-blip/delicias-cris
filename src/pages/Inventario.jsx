import React from 'react';
export default function Inventario({ irAHome }) {
    return (
        <div style={estilos.contenedor}>
            <h2>Control de Inventario Personalizado</h2>
            <p>Esta pantalla está vacía por ahora.</p>
            <button onClick={irAHome} style={estilos.btn}>Volver al Home</button>
        </div>
    );
}