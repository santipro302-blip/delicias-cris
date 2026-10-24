import React, { useState, useEffect } from 'react';

const Asistencia = ({ irAHome }) => {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [estadoAsistencia, setEstadoAsistencia] = useState('entrada'); // 'entrada', 'salida', 'finalizado'
  const [horaIngreso, setHoraIngreso] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [resumenJornada, setResumenJornada] = useState('');
  
  // Estado exclusivo para el Administrador (lista de todas las asistencias)
  const [listaAsistenciasGlobales, setListaAsistenciasGlobales] = useState([]);

  useEffect(() => {
    // 1. Cargar el usuario actual
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuarioGuardado) {
      setUsuarioActual(usuarioGuardado);

      // 2. Si es Administrador, cargar todos los registros globales del localStorage
      if (usuarioGuardado.rol === 'Administrador') {
        const registrosTotales = JSON.parse(localStorage.getItem('asistenciasDiarias')) || [];
        setListaAsistenciasGlobales(registrosTotales);
      }

      // 3. Verificar si el usuario actual ya tiene registro para el día de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const registros = JSON.parse(localStorage.getItem('asistenciasDiarias')) || [];
      const registroHoy = registros.find(r => r.email === usuarioGuardado.email && r.fecha === hoy);

      if (registroHoy) {
        if (registroHoy.horaSalida) {
          setEstadoAsistencia('finalizado');
          setHoraIngreso(registroHoy.horaIngreso);
          setHoraSalida(registroHoy.horaSalida);
          setResumenJornada(registroHoy.tiempoTotal);
          setMensaje({ texto: 'Ya has completado tu turno y registro de asistencia el día de hoy.', tipo: 'exito' });
        } else {
          setEstadoAsistencia('salida');
          setHoraIngreso(registroHoy.horaIngreso);
        }
      }
    }
  }, []);

  // Función para registrar la Hora de Entrada
  const registrarEntrada = () => {
    const ahora = new Date();
    const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const horaSimple = ahora.toTimeString().split(' ')[0];
    const hoy = ahora.toISOString().split('T')[0];

    setHoraIngreso(horaFormateada);

    let registros = JSON.parse(localStorage.getItem('asistenciasDiarias')) || [];
    const nuevoRegistro = {
      email: usuarioActual.email,
      fecha: hoy,
      horaIngreso: horaSimple,
      horaSalida: null,
      tiempoTotal: 'En curso...'
    };

    registros.push(nuevoRegistro);
    localStorage.setItem('asistenciasDiarias', JSON.stringify(registros));

    // Actualizar vista admin si aplica
    setListaAsistenciasGlobales(registros);
    setEstadoAsistencia('salida');
    setMensaje({ texto: `¡Hora de ingreso registrada exitosamente a las ${horaFormateada}!`, tipo: 'exito' });
  };

  // Función para registrar la Hora de Salida y calcular el tiempo
  const registrarSalida = () => {
    const ahora = new Date();
    const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const horaSimple = ahora.toTimeString().split(' ')[0];
    const hoy = ahora.toISOString().split('T')[0];

    setHoraSalida(horaFormateada);

    let registros = JSON.parse(localStorage.getItem('asistenciasDiarias')) || [];
    const index = registros.findIndex(r => r.email === usuarioActual.email && r.fecha === hoy);

    if (index !== -1) {
      const ingreso = registros[index].horaIngreso;
      
      const [hIn, mIn, sIn] = ingreso.split(':').map(Number);
      const [hOut, mOut, sOut] = horaSimple.split(':').map(Number);

      const segundosIngreso = hIn * 3600 + mIn * 60 + sIn;
      const segundosSalida = hOut * 3600 + mOut * 60 + sOut;
      let diferenciaSegundos = segundosSalida - segundosIngreso;

      if (diferenciaSegundos < 0) diferenciaSegundos = 0;

      const horas = Math.floor(diferenciaSegundos / 3600);
      const minutos = Math.floor((diferenciaSegundos % 3600) / 60);
      const textoJornada = `${horas} horas y ${minutos} minutos`;

      registros[index].horaSalida = horaSimple;
      registros[index].tiempoTotal = textoJornada;
      localStorage.setItem('asistenciasDiarias', JSON.stringify(registros));

      setListaAsistenciasGlobales(registros);
      setResumenJornada(textoJornada);
      setEstadoAsistencia('finalizado');
      setMensaje({ texto: `¡Jornada finalizada con éxito! Tu jornada fue de ${textoJornada}.`, tipo: 'exito' });
    }
  };

  return (
    <div style={styles.pageBackground}>
      <div style={usuarioActual?.rol === 'Administrador' ? styles.cardContainerAdmin : styles.cardContainer}>
        <div style={usuarioActual?.rol === 'Administrador' ? styles.cardAdmin : styles.card}>
          
          <button onClick={irAHome} style={styles.backButton}>
            ← Volver al Inicio
          </button>

          <h2 style={styles.title}>Control de Asistencia</h2>
          
          {usuarioActual && (
            <p style={styles.subtitle}>
              Usuario: <strong>{usuarioActual.email}</strong> ({usuarioActual.rol})
            </p>
          )}

          {mensaje.texto && (
            <div style={mensaje.tipo === 'exito' ? styles.alertExito : styles.alertError}>
              {mensaje.texto}
            </div>
          )}

          {/* Sección de marcaje individual (Disponible para todos) */}
          <div style={styles.contentBox}>
            <h3 style={styles.sectionHeader}>Mi Turno de Hoy</h3>
            {estadoAsistencia === 'entrada' && (
              <div>
                <p style={styles.instructionText}>Haz clic en el botón para registrar tu entrada al turno actual.</p>
                <button onClick={registrarEntrada} style={styles.actionButton}>
                  Registrar Hora de Entrada
                </button>
              </div>
            )}

            {estadoAsistencia === 'salida' && (
              <div>
                <p style={styles.instructionText}>Ingreso registrado a las: <strong>{horaIngreso}</strong></p>
                <button onClick={registrarSalida} style={styles.actionButtonSalida}>
                  Registrar Hora de Salida
                </button>
              </div>
            )}

            {estadoAsistencia === 'finalizado' && (
              <div>
                <p style={styles.instructionText}>Entrada: <strong>{horaIngreso}</strong> | Salida: <strong>{horaSalida}</strong></p>
                <div style={styles.resumenBox}>
                  Tu jornada fue de: <strong>{resumenJornada}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Panel de Supervisión Exclusivo para Administrador */}
          {usuarioActual?.rol === 'Administrador' && (
            <div style={styles.adminSection}>
              <h3 style={styles.adminTitle}>Registro de Asistencias (Supervisión)</h3>
              {listaAsistenciasGlobales.length === 0 ? (
                <p style={styles.instructionText}>No hay registros de asistencia guardados todavía.</p>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.trHeader}>
                        <th style={styles.th}>Correo Trabajador</th>
                        <th style={styles.th}>Fecha</th>
                        <th style={styles.th}>Ingreso</th>
                        <th style={styles.th}>Salida</th>
                        <th style={styles.th}>Duración Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaAsistenciasGlobales.map((item, index) => (
                        <tr key={index} style={styles.trBody}>
                          <td style={styles.td}><strong>{item.email}</strong></td>
                          <td style={styles.td}>{item.fecha}</td>
                          <td style={styles.td}>{item.horaIngreso || '-'}</td>
                          <td style={styles.td}>{item.horaSalida || 'En curso...'}</td>
                          <td style={styles.td}>{item.tiempoTotal || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Estilos limpios y adaptables para tarjeta simple o panel ancho de admin
const styles = {
  pageBackground: {
    minHeight: '100vh',
    backgroundColor: '#f6f6f6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: 'border-box',
    padding: '20px'
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  cardContainerAdmin: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: '850px'
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '450px',
    borderRadius: '12px',
    padding: '30px 25px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
    borderTop: '6px solid #e08238',
    textAlign: 'center',
    boxSizing: 'border-box',
    position: 'relative'
  },
  cardAdmin: {
    backgroundColor: '#ffffff',
    width: '100%',
    borderRadius: '12px',
    padding: '30px 25px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
    borderTop: '6px solid #e08238',
    textAlign: 'center',
    boxSizing: 'border-box',
    position: 'relative'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#e08238',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '15px',
    display: 'block',
    textAlign: 'left',
    padding: '0'
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#222222'
  },
  subtitle: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: '#666666'
  },
  contentBox: {
    padding: '20px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    border: '1px solid #e2e2e2',
    marginTop: '15px',
    textAlign: 'center'
  },
  sectionHeader: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: '10px'
  },
  instructionText: {
    fontSize: '13px',
    color: '#666666',
    marginBottom: '15px'
  },
  actionButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#e08238',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(224, 130, 56, 0.3)'
  },
  actionButtonSalida: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#d9534f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(217, 83, 79, 0.3)'
  },
  resumenBox: {
    marginTop: '10px',
    padding: '12px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '6px',
    fontSize: '14px',
    border: '1px solid #c8e6c9'
  },
  adminSection: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '2px solid #eee',
    textAlign: 'left'
  },
  adminTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#222',
    marginBottom: '15px'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    textAlign: 'left'
  },
  trHeader: {
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #ddd'
  },
  th: {
    padding: '10px',
    color: '#444',
    fontWeight: 'bold'
  },
  trBody: {
    borderBottom: '1px solid #eee'
  },
  td: {
    padding: '10px',
    color: '#555'
  },
  alertExito: {
    padding: '10px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '15px',
    textAlign: 'left'
  },
  alertError: {
    padding: '10px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '15px',
    textAlign: 'left'
  }
};

export default Asistencia;