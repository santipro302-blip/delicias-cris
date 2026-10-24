import './Registro.css';
import React, { useState } from 'react';
import { registrarUsuarioDB } from '../services/api';

export default function Registro({ irALogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje({ texto: '', tipo: '' });

        // Llamar al backend para registrar el usuario en SQL Server
        const resultado = await registrarUsuarioDB(email, password, 'Trabajador');

        if (resultado.success) {
            setMensaje({ texto: "¡Registro exitoso! Ya puedes iniciar sesión.", tipo: "exito" });
            setEmail('');
            setPassword('');
        } else {
            setMensaje({ texto: resultado.message || "Error al registrar el usuario.", tipo: "error" });
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <h2>Crear Cuenta</h2>
                
                {mensaje.texto && (
                    <div className={`mensaje-alerta ${mensaje.tipo}`}>
                        {mensaje.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="correo@ejemplo.com" 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="********" 
                        />
                    </div>

                    <button type="submit" className="btn-primary">Registrarse</button>
                </form>

                <p className="auth-link">
                    ¿Ya tienes cuenta?{' '}
                    <button type="button" onClick={irALogin} className="link-btn">
                        Inicia sesión aquí
                    </button>
                </p>
            </div>
        </div>
    );
}