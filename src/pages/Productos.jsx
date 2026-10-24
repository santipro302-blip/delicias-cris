import React, { useState, useEffect } from 'react';
import { obtenerProductos } from '../services/api';

const Productos = ({ irAHome }) => {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [reciboUltimaCompra, setReciboUltimaCompra] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Estados para el Panel de Administrador (CRUD y Ventas)
  const [historialVentas, setHistorialVentas] = useState([]);
  const [modoAdminTab, setModoAdminTab] = useState('gestion'); // 'gestion' o 'ventas'
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [precioNuevo, setPrecioNuevo] = useState('');
  const [stockNuevo, setStockNuevo] = useState('');
  const [productoEditando, setProductoEditando] = useState(null);

  useEffect(() => {
    // 1. Cargar usuario actual
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuarioGuardado) {
      setUsuarioActual(usuarioGuardado);
    }

    // 2. Cargar productos desde SQL Server y ventas desde localStorage
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // Cargar productos desde el backend conectado a SQL Server
    const productosDesdeDB = await obtenerProductos();
    if (productosDesdeDB && productosDesdeDB.length > 0) {
      setProductos(productosDesdeDB);
    } else {
      // Fallback por si la base de datos está vacía o hay algún problema temporal
      setProductos([
        { id: 1, nombre: 'Pan de Bono', precio: 2500, stock: 15 },
        { id: 2, nombre: 'Almojábana', precio: 3000, stock: 8 },
        { id: 3, nombre: 'Café con Leche', precio: 2000, stock: 0 },
        { id: 4, nombre: 'Empanada de Carne', precio: 3500, stock: 20 }
      ]);
    }

    const ventasGuardadas = JSON.parse(localStorage.getItem('historialVentas')) || [];
    setHistorialVentas(ventasGuardadas);
  };

  const handleCantidadChange = (id, valor) => {
    const cantidad = Math.max(0, parseInt(valor) || 0);
    setCantidades({
      ...cantidades,
      [id]: cantidad
    });
  };

  const calcularSubtotal = () => {
    let total = 0;
    productos.forEach(prod => {
      const cant = cantidades[prod.id] || 0;
      total += prod.precio * cant;
    });
    return total;
  };

  const finalizarCompra = () => {
    const itemsComprados = [];
    let granTotal = 0;

    productos.forEach(prod => {
      const cant = cantidades[prod.id] || 0;
      if (cant > 0) {
        if (cant > prod.stock) {
          setMensaje({ texto: `No hay suficiente stock para ${prod.nombre}. Stock disponible: ${prod.stock}`, tipo: 'error' });
          return;
        }
        const precioTotalItem = prod.precio * cant;
        itemsComprados.push({
          nombre: prod.nombre,
          cantidad: cant,
          precioUnitario: prod.precio,
          precioTotal: precioTotalItem
        });
        granTotal += precioTotalItem;
      }
    });

    if (itemsComprados.length === 0) {
      setMensaje({ texto: 'Por favor selecciona al menos un producto y su cantidad.', tipo: 'error' });
      return;
    }

    const nuevosProductos = productos.map(prod => {
      const cantComprada = cantidades[prod.id] || 0;
      if (cantComprada > 0) {
        return { ...prod, stock: prod.stock - cantComprada };
      }
      return prod;
    });

    setProductos(nuevosProductos);

    const fechaActual = new Date().toLocaleString();
    const nuevaVenta = {
      fecha: fechaActual,
      usuario: usuarioActual?.email || 'Desconocido',
      items: itemsComprados,
      total: granTotal
    };

    const ventasActualizadas = [...historialVentas, nuevaVenta];
    setHistorialVentas(ventasActualizadas);
    localStorage.setItem('historialVentas', JSON.stringify(ventasActualizadas));

    setReciboUltimaCompra({
      fecha: fechaActual,
      items: itemsComprados,
      total: granTotal
    });

    setCantidades({});
    setMensaje({ texto: '¡Compra finalizada y registrada con éxito!', tipo: 'exito' });
  };

  // Funciones CRUD para Administrador
  const guardarProductoAdmin = (e) => {
    e.preventDefault();
    if (!nombreNuevo || !precioNuevo || !stockNuevo) {
      setMensaje({ texto: 'Por favor completa todos los campos del producto.', tipo: 'error' });
      return;
    }

    let actualizados = [];
    if (productoEditando) {
      actualizados = productos.map(p => p.id === productoEditando.id ? {
        ...p,
        nombre: nombreNuevo,
        precio: parseFloat(precioNuevo),
        stock: parseInt(stockNuevo)
      } : p);
      setMensaje({ texto: '¡Producto actualizado correctamente!', tipo: 'exito' });
    } else {
      const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
      const nuevoProd = {
        id: nuevoId,
        nombre: nombreNuevo,
        precio: parseFloat(precioNuevo),
        stock: parseInt(stockNuevo)
      };
      actualizados = [...productos, nuevoProd];
      setMensaje({ texto: '¡Producto agregado con éxito!', tipo: 'exito' });
    }

    setProductos(actualizados);
    limpiarFormAdmin();
  };

  const iniciarEdicion = (prod) => {
    setProductoEditando(prod);
    setNombreNuevo(prod.nombre);
    setPrecioNuevo(prod.precio);
    setStockNuevo(prod.stock);
  };

  const limpiarFormAdmin = () => {
    setProductoEditando(null);
    setNombreNuevo('');
    setPrecioNuevo('');
    setStockNuevo('');
  };

  const esAdmin = usuarioActual && (usuarioActual.rol === 'Administrador' || usuarioActual.email === 'donacris@gmail.com');

  return (
    <div style={styles.pageBackground}>
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          
          <button onClick={irAHome} style={styles.backButton}>
            ← Volver al Inicio
          </button>

          <h2 style={styles.title}>Módulo de Productos y Ventas</h2>
          
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

          {/* PANEL EXCLUSIVO PARA ADMINISTRADOR */}
          {esAdmin && (
            <div style={styles.adminPanelContainer}>
              <div style={styles.adminTabs}>
                <button 
                  onClick={() => setModoAdminTab('gestion')} 
                  style={{ ...styles.tabBtn, backgroundColor: modoAdminTab === 'gestion' ? '#e08238' : '#ddd', color: modoAdminTab === 'gestion' ? '#fff' : '#333' }}
                >
                  ⚙️ Gestionar Productos
                </button>
                <button 
                  onClick={() => setModoAdminTab('ventas')} 
                  style={{ ...styles.tabBtn, backgroundColor: modoAdminTab === 'ventas' ? '#e08238' : '#ddd', color: modoAdminTab === 'ventas' ? '#fff' : '#333' }}
                >
                  📊 Historial de Ventas ({historialVentas.length})
                </button>
              </div>

              {modoAdminTab === 'gestion' ? (
                <div style={styles.adminFormBox}>
                  <h3 style={styles.sectionHeader}>{productoEditando ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
                  <form onSubmit={guardarProductoAdmin} style={styles.formGrid}>
                    <input 
                      type="text" 
                      placeholder="Nombre del producto" 
                      value={nombreNuevo} 
                      onChange={(e) => setNombreNuevo(e.target.value)} 
                      style={styles.inputAdmin} 
                    />
                    <input 
                      type="number" 
                      placeholder="Precio ($)" 
                      value={precioNuevo} 
                      onChange={(e) => setPrecioNuevo(e.target.value)} 
                      style={styles.inputAdmin} 
                    />
                    <input 
                      type="number" 
                      placeholder="Stock inicial" 
                      value={stockNuevo} 
                      onChange={(e) => setStockNuevo(e.target.value)} 
                      style={styles.inputAdmin} 
                    />
                    <div style={styles.formButtonsContainer}>
                      <button type="submit" style={styles.btnGuardarAdmin}>
                        {productoEditando ? 'Actualizar Producto' : 'Guardar Producto'}
                      </button>
                      {productoEditando && (
                        <button type="button" onClick={limpiarFormAdmin} style={styles.btnCancelarAdmin}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ) : (
                <div style={styles.adminVentasBox}>
                  <h3 style={styles.sectionHeader}>Historial de Ventas Realizadas</h3>
                  {historialVentas.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#666' }}>Aún no hay ventas registradas.</p>
                  ) : (
                    <div style={styles.listaVentas}>
                      {historialVentas.slice().reverse().map((venta, idx) => (
                        <div key={idx} style={styles.ventaCard}>
                          <div style={styles.ventaHeaderInfo}>
                            <span>📅 <strong>{venta.fecha}</strong></span>
                            <span>👤 Vendedor: {venta.usuario}</span>
                          </div>
                          <ul style={styles.ventaItemsList}>
                            {venta.items.map((it, i) => (
                              <li key={i}>{it.nombre} (x{it.cantidad}) - ${it.precioTotal.toLocaleString()}</li>
                            ))}
                          </ul>
                          <div style={styles.ventaTotalFooter}>
                            Total Venta: <strong>${venta.total.toLocaleString()}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LISTADO DE PRODUCTOS (VENTAS) */}
          <div style={styles.catalogSection}>
            <h3 style={styles.sectionHeader}>Catálogo de Productos y Pedidos</h3>
            
            <div style={styles.gridProductos}>
              {productos.map(prod => {
                const isAgotado = prod.stock === 0;

                return (
                  <div key={prod.id} style={{ ...styles.productoCard, opacity: isAgotado ? 0.7 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={styles.prodNombre}>{prod.nombre}</h4>
                      {esAdmin && (
                        <button onClick={() => { setModoAdminTab('gestion'); iniciarEdicion(prod); }} style={styles.btnEditarMini}>
                          Editar
                        </button>
                      )}
                    </div>
                    <p style={styles.prodPrecio}>Precio: ${prod.precio.toLocaleString()}</p>
                    <p style={styles.prodStock}>Stock disponible: {prod.stock}</p>

                    {isAgotado ? (
                      <div style={styles.alertaAgotado}>
                        Este producto está agotado, reabastecer por favor
                      </div>
                    ) : (
                      <div style={styles.inputCantidadContainer}>
                        <label style={styles.labelCantidad}>Cantidad:</label>
                        <input
                          type="number"
                          min="0"
                          max={prod.stock}
                          value={cantidades[prod.id] || ''}
                          onChange={(e) => handleCantidadChange(prod.id, e.target.value)}
                          placeholder="0"
                          style={styles.inputCantidad}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subtotal y Botón de Finalizar Compra */}
          <div style={styles.subtotalContainer}>
            <div>
              <span style={styles.subtotalText}>Subtotal de la compra: </span>
              <span style={styles.subtotalMonto}>${calcularSubtotal().toLocaleString()}</span>
            </div>
            <button onClick={finalizarCompra} style={styles.btnFinalizar}>
              Finalizar Compra
            </button>
          </div>

          {/* Recibo de Compra Generado */}
          {reciboUltimaCompra && (
            <div style={styles.reciboBox}>
              <h3 style={styles.reciboTitle}>🧾 Recibo de Venta Generado</h3>
              <p style={styles.reciboFecha}>Fecha: {reciboUltimaCompra.fecha}</p>
              
              <table style={styles.tablaRecibo}>
                <thead>
                  <tr style={styles.trReciboHeader}>
                    <th style={styles.thRecibo}>Producto</th>
                    <th style={styles.thRecibo}>Cant.</th>
                    <th style={styles.thRecibo}>Precio Unit.</th>
                    <th style={styles.thRecibo}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reciboUltimaCompra.items.map((item, index) => (
                    <tr key={index} style={styles.trReciboBody}>
                      <td style={styles.tdRecibo}>{item.nombre}</td>
                      <td style={styles.tdRecibo}>{item.cantidad}</td>
                      <td style={styles.tdRecibo}>${item.precioUnitario.toLocaleString()}</td>
                      <td style={styles.tdRecibo}>${item.precioTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.reciboGranTotal}>
                <span>Gran Total de la Compra:</span>
                <span style={styles.montoGranTotal}>${reciboUltimaCompra.total.toLocaleString()}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const styles = {
  pageBackground: {
    minHeight: '100vh',
    backgroundColor: '#f6f6f6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: 'border-box',
    padding: '30px 20px'
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '750px',
    borderRadius: '12px',
    padding: '30px 25px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
    borderTop: '6px solid #e08238',
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
    color: '#222222',
    textAlign: 'center'
  },
  subtitle: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: '#666666',
    textAlign: 'center'
  },
  adminPanelContainer: {
    marginBottom: '25px',
    backgroundColor: '#fffaf0',
    border: '1px solid #ffe0b2',
    borderRadius: '8px',
    padding: '15px'
  },
  adminTabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  },
  tabBtn: {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  adminFormBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  inputAdmin: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '13px',
    outline: 'none'
  },
  formButtonsContainer: {
    display: 'flex',
    gap: '10px'
  },
  btnGuardarAdmin: {
    backgroundColor: '#e08238',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  btnCancelarAdmin: {
    backgroundColor: '#757575',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  btnEditarMini: {
    backgroundColor: '#ffa000',
    color: '#fff',
    border: 'none',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  adminVentasBox: {
    maxHeight: '300px',
    overflowY: 'auto'
  },
  listaVentas: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  ventaCard: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '12px'
  },
  ventaHeaderInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    color: '#555'
  },
  ventaItemsList: {
    margin: '5px 0',
    paddingLeft: '15px',
    color: '#333'
  },
  ventaTotalFooter: {
    textAlign: 'right',
    color: '#2e7d32',
    marginTop: '5px'
  },
  catalogSection: {
    marginTop: '15px'
  },
  sectionHeader: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: '12px',
    borderBottom: '1px solid #eee',
    paddingBottom: '6px'
  },
  gridProductos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  productoCard: {
    backgroundColor: '#fafafa',
    border: '1px solid #e2e2e2',
    borderRadius: '8px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  prodNombre: {
    margin: '0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#222'
  },
  prodPrecio: {
    margin: '0',
    fontSize: '13px',
    color: '#555'
  },
  prodStock: {
    margin: '0',
    fontSize: '12px',
    color: '#777'
  },
  alertaAgotado: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    border: '1px solid #ffcdd2'
  },
  inputCantidadContainer: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  labelCantidad: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#444'
  },
  inputCantidad: {
    width: '80px',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '13px',
    textAlign: 'center',
    outline: 'none'
  },
  subtotalContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    border: '1px solid #ffe0b2',
    padding: '15px 20px',
    borderRadius: '8px',
    marginTop: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  subtotalText: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#e08238'
  },
  subtotalMonto: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#d84315'
  },
  btnFinalizar: {
    backgroundColor: '#2e7d32',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(46, 125, 50, 0.3)'
  },
  reciboBox: {
    marginTop: '25px',
    padding: '20px',
    backgroundColor: '#f1f8e9',
    border: '1px solid #c5e1a5',
    borderRadius: '8px',
    textAlign: 'left'
  },
  reciboTitle: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2e7d32'
  },
  reciboFecha: {
    margin: '0 0 15px 0',
    fontSize: '12px',
    color: '#555'
  },
  tablaRecibo: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    marginBottom: '15px'
  },
  trReciboHeader: {
    backgroundColor: '#dcedc8',
    borderBottom: '2px solid #c5e1a5'
  },
  thRecibo: {
    padding: '8px',
    color: '#33691e',
    textAlign: 'left'
  },
  trReciboBody: {
    borderBottom: '1px solid #e1f5fe'
  },
  tdRecibo: {
    padding: '8px',
    color: '#333'
  },
  reciboGranTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '2px dashed #aed581',
    paddingTop: '10px',
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#2e7d32'
  },
  montoGranTotal: {
    fontSize: '18px',
    color: '#1b5e20'
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

export default Productos;