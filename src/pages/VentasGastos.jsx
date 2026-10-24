import React from 'react';
export default function VentasGastos({ irAHome }) {
    return (
        <div style={estilos.contenedor}>
            <h2>Registro de Ventas y Gastos</h2>
            <p>Esta pantalla está vacía por ahora.</p>
            <button onClick={irAHome} style={estilos.btn}>Volver al Home</button>
        </div>
    );
}