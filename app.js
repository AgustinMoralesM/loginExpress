// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// --- Middlewares ---
app.use(cors()); // Permite que React (localhost:5173 o 3001) acceda al backend
app.use(express.json()); // Permite recibir JSON por POST

// --- Conexión a la base de datos ---
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // agrega tu contraseña si tienes
  database: 'login',
});

// --- Rutas ---
app.get('/', (req, res) => {
  res.send('Backend de Mallplaza funcionando correctamente');
});

// 🔐 LOGIN (POST para seguridad)
app.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;

  if (!usuario || !clave) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  try {
    const [results] = await connection.query(
      'SELECT * FROM usuarios WHERE usuario = ? AND clave = ?',
      [usuario, clave]
    );

    if (results.length > 0) {
      console.log('Login correcto para:', usuario);
      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión correcto',
        usuario: results[0].usuario,
      });
    } else {
      console.log('Credenciales incorrectas');
      return res
        .status(401)
        .json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    console.error('Error en la base de datos:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error en el servidor' });
  }
});

// --- Arrancar servidor ---
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
