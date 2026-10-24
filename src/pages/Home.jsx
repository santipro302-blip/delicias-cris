import React from 'react';

export default function Home({ cambiarVista, cerrarSesion }) {
    return (
        <div style={styles.homeContainer}>
            {/* Barra superior */}
            <header style={styles.header}>
                <h1>Delicias al Inventario - Panel Principal</h1>
                <button onClick={cerrarSesion} style={styles.logoutBtn}>Cerrar Sesión</button>
            </header>

            {/* Contenido de opciones */}
            <main style={styles.mainContent}>
                <h2>Selecciona una opción:</h2>
                <div style={styles.gridContainer}>

                    <div style={styles.card} onClick={() => cambiarVista('productos')}>
                        <h3>Gestión de Productos y Ventas</h3>
                        <p>Catálogo, control de stock, registro de ventas y panel de administración.</p>
                    </div>

                    <div style={styles.card} onClick={() => cambiarVista('asistencia')}>
                        <h3>Control de Asistencia</h3>
                        <p>Registra entradas, salidas y supervisión de turnos.</p>
                    </div>

                </div>
            </main>
        </div>
    );
}

const styles = {
    homeContainer: {
        minHeight: '100vh',
        backgroundColor: '#f6f6f6',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    header: {
        backgroundColor: '#ffffff',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '4px solid #e08238',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    },
    logoutBtn: {
        backgroundColor: '#ff4d4d',
        color: '#fff',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    mainContent: {
        padding: '40px',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center'
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '30px',
        justifyContent: 'center'
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '25px 20px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        borderTop: '5px solid #e08238',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        textAlign: 'left'
    }
};