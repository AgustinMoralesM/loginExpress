const mongoose = require('mongoose');

// Estructura del documento "usuario"
const usuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  clave: { type: String, required: true },
});

// Exportamos el modelo
module.exports = mongoose.model('Usuario', usuarioSchema);
