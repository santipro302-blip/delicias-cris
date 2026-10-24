import React, { useState } from 'react';
import Login from './pages/Login';
import Registro from './components/Registro';
import Home from './pages/Home';
import Productos from './pages/Productos';
import Asistencia from './pages/Asistencia';

function App() {
  // Estados posibles de navegación
  const [vistaActual, setVistaActual] = useState('login');

  const iniciarSesionExitoso = () => {
    setVistaActual('home');
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioActual');
    setVistaActual('login');
  };

  return (
    <div>
      {vistaActual === 'login' && (
        <Login 
          irARegistro={() => setVistaActual('registro')} 
          onLoginSuccess={iniciarSesionExitoso} 
        />
      )}

      {vistaActual === 'registro' && (
        <Registro 
          irALogin={() => setVistaActual('login')} 
        />
      )}

      {vistaActual === 'home' && (
        <Home 
          cambiarVista={(vista) => setVistaActual(vista)} 
          cerrarSesion={cerrarSesion} 
        />
      )}

      {vistaActual === 'productos' && (
        <Productos 
          irAHome={() => setVistaActual('home')} 
        />
      )}

      {vistaActual === 'asistencia' && (
        <Asistencia 
          irAHome={() => setVistaActual('home')} 
        />
      )}
    </div>
  );
}

export default App;