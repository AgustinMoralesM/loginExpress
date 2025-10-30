import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// 🔌 Conexión a MongoDB
const uri = "mongodb://127.0.0.1:27017/mllplaza";
mongoose.connect(uri)
  .then(() => console.log("✅ Conectado a MongoDB correctamente (mllplaza)"))
  .catch(err => console.error("❌ Error al conectar a MongoDB:", err));

// 🧱 Esquema y modelo de usuario
const UsuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  clave: { type: String, required: true }
}, { collection: "usuarios" });

const Usuario = mongoose.model("Usuario", UsuarioSchema);

// 🔹 Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor Backend funcionando 🚀");
});

// 🔐 Registro de usuario
app.post("/register", async (req, res) => {
  const { usuario, clave } = req.body;
  if (!usuario || !clave) return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });

  try {
    const existente = await Usuario.findOne({ usuario });
    if (existente) return res.status(400).json({ success: false, message: "El usuario ya existe" });

    const nuevoUsuario = new Usuario({ usuario, clave });
    await nuevoUsuario.save();
    res.status(201).json({ success: true, message: "Usuario registrado correctamente", usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

// 🔐 Login de usuario
app.post("/login", async (req, res) => {
  const { usuario, clave } = req.body;
  if (!usuario || !clave) return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });

  try {
    const user = await Usuario.findOne({ usuario, clave });
    if (user) {
      res.status(200).json({ success: true, message: "Inicio de sesión correcto", usuario: user.usuario });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

// 📄 Listar todos los usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, "-__v -clave"); // excluye __v y clave
    res.status(200).json({ success: true, usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al obtener usuarios" });
  }
});

// ✏️ Actualizar un usuario por ID
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { usuario, clave } = req.body;

  try {
    const actualizado = await Usuario.findByIdAndUpdate(
      id,
      { usuario, clave },
      { new: true, runValidators: true }
    );

    if (!actualizado) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    res.status(200).json({ success: true, message: "Usuario actualizado", usuario: actualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al actualizar usuario" });
  }
});

// 🗑️ Eliminar un usuario por ID
app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const eliminado = await Usuario.findByIdAndDelete(id);
    if (!eliminado) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    res.status(200).json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al eliminar usuario" });
  }
});

// 🌐 Puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
