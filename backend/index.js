const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración directa por IP local y puerto
const dbConfig = {
    user: 'sa',
    password: '12345678', // La contraseña que le asignaste a sa
    server: '127.0.0.1',
    port: 1433,
    database: 'DeliciasDB',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Ruta para obtener todos los productos del inventario
app.get('/api/productos', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Productos');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send({ message: 'Error en el servidor' });
    }
});

// Ruta para iniciar sesión consultando la tabla Usuarios en SQL Server
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .query('SELECT * FROM Usuarios WHERE email = @email AND password = @password');
        
        if (result.recordset.length > 0) {
            // Usuario encontrado con éxito
            res.json({ success: true, usuario: result.recordset[0] });
        } else {
            res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para registrar un nuevo usuario en la base de datos
app.post('/api/registro', async (req, res) => {
    const { email, password, rol } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        
        // Verificar si el correo ya existe
        let checkUser = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Usuarios WHERE email = @email');
            
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado.' });
        }

        // Insertar el nuevo usuario en SQL Server
        await pool.request()
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .input('rol', sql.VarChar, rol || 'Trabajador')
            .query('INSERT INTO Usuarios (email, password, rol) VALUES (@email, @password, @rol)');

        res.json({ success: true, message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor al registrar' });
    }
});

app.listen(5000, async () => {
    console.log('Servidor Backend corriendo en http://localhost:5000');
    try {
        await sql.connect(dbConfig);
        console.log('Conexión exitosa a SQL Server');
    } catch (err) {
        console.error('Error al conectar con SQL Server:', err.message);
    }
});