import React from 'react';
export default function Pedidos({ irAHome }) {
    return (
        <div style={estilos.contenedor}>
            <h2>Gestión de Pedidos de Mercancía</h2>
            <p>Esta pantalla está vacía por ahora.</p>
            <button onClick={irAHome} style={estilos.btn}>Volver al Home</button>
        </div>
    );
}