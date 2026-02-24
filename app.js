import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

/* ================== CONEXIÓN ================== */

const uri = "mongodb://127.0.0.1:27017/mllplaza";

mongoose.connect(uri)
  .then(() => console.log("✅ Conectado a MongoDB correctamente (mllplaza)"))
  .catch(err => console.error("❌ Error conectando MongoDB:", err));

/* ================== MODELO ================== */

const usuarioSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true,
    unique: true
  },
  clave: {
    type: String,
    required: true
  }
}, { collection: "usuarios" });

const Usuario = mongoose.model("Usuario", usuarioSchema);

/* ================== RUTA TEST ================== */

app.get("/", (req, res) => {
  res.send("Servidor Mallplaza funcionando 🚀");
});

/* ================== REGISTRO ================== */

app.post("/register", async (req, res) => {
  try {
    const { usuario, clave } = req.body;

    if (!usuario || !clave) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios"
      });
    }

    const existe = await Usuario.findOne({ usuario });

    if (existe) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe"
      });
    }

    const hash = await bcrypt.hash(clave, 10);

    const nuevoUsuario = new Usuario({
      usuario,
      clave: hash
    });

    await nuevoUsuario.save();

    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente"
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
});

/* ================== LOGIN ================== */

app.post("/login", async (req, res) => {
  try {
    const { usuario, clave } = req.body;

    if (!usuario || !clave) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios"
      });
    }

    const user = await Usuario.findOne({ usuario });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const coincide = await bcrypt.compare(clave, user.clave);

    if (!coincide) {
      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta"
      });
    }

    res.status(200).json({
      success: true,
      message: "Inicio de sesión correcto",
      usuario: user.usuario
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
});

/* ================== RECUPERAR CONTRASEÑA ================== */

app.put("/recuperar", async (req, res) => {
  try {
    const { usuario, nuevaClave } = req.body;

    if (!usuario || !nuevaClave) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios"
      });
    }

    const user = await Usuario.findOne({ usuario });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const hash = await bcrypt.hash(nuevaClave, 10);

    user.clave = hash;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente"
    });

  } catch (error) {
    console.error("Error recuperando contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor"
    });
  }
});

/* ================== SERVIDOR ================== */

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});