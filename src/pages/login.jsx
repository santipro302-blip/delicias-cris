import React, { useState } from 'react';
import { iniciarSesionDB } from '../services/api';

const Login = ({ irARegistro, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Administrador');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    // Llamar al backend para validar el usuario en la base de datos SQL Server
    const resultado = await iniciarSesionDB(username, password);

    if (resultado.success && resultado.usuario) {
      const usuarioDB = resultado.usuario;
      const rolReal = usuarioDB.rol; // El rol guardado en la base de datos

      // Validar si el rol seleccionado en el selector coincide con el rol real del usuario
      if (role !== rolReal) {
        setMensaje({ texto: `El rol seleccionado no corresponde al de este usuario (Su rol es ${rolReal}).`, tipo: "error" });
        return;
      }

      // Guardar sesión en localStorage
      const datosSesion = { email: usuarioDB.email, rol: rolReal };
      localStorage.setItem('usuarioActual', JSON.stringify(datosSesion));

      if (onLoginSuccess) {
        onLoginSuccess(rolReal);
      }
    } else {
      setMensaje({ texto: resultado.message || 'Correo o contraseña incorrectos.', tipo: "error" });
    }
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          
          <div style={styles.logoPlaceholder}></div>

          <h1 style={styles.title}>Delicias al Inventario</h1>

          {mensaje.texto && (
            <div style={mensaje.tipo === 'exito' ? styles.alertExito : styles.alertError}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Usuario / Username</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña / Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  type="password"
                  placeholder="Contraseña / Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Rol de Usuario</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.selectInput}
              >
                <option value="Administrador">Administrador</option>
                <option value="Trabajador">Trabajador</option>
              </select>
            </div>

            <button type="submit" style={styles.submitButton}>
              Iniciar Sesión / Log In
            </button>

          </form>

          <p style={styles.authLinkText}>
            ¿No tienes cuenta?{' '}
            <button type="button" onClick={irARegistro} style={styles.linkBtn}>
              Regístrate aquí
            </button>
          </p>

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
    alignItems: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: 'border-box'
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 15px',
    width: '100%'
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '380px',
    borderRadius: '12px',
    padding: '35px 25px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
    borderTop: '6px solid #e08238',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  logoPlaceholder: {
    width: '70px',
    height: '70px',
    backgroundColor: '#e2e2e2',
    borderRadius: '8px',
    margin: '0 auto 15px auto'
  },
  title: {
    margin: '0 0 22px 0',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#222222'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#444444'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '14px',
    color: '#888888'
  },
  input: {
    width: '100%',
    padding: '10px 10px 10px 36px',
    borderRadius: '6px',
    border: '1px solid #cccccc',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  selectInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #e08238',
    backgroundColor: '#fcfcfc',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#e08238',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 2px 5px rgba(224, 130, 56, 0.3)'
  },
  authLinkText: {
    marginTop: '16px',
    fontSize: '13px',
    color: '#666666'
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#e08238',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    padding: '0',
    textDecoration: 'underline'
  },
  alertExito: {
    padding: '10px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '15px'
  },
  alertError: {
    padding: '10px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '15px'
  }
};

export default Login;