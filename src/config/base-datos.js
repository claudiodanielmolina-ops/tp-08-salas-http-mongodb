// src/config/base-datos.js
const mongoose = require("mongoose");
const dns = require("node:dns");
const { leerUriMongo } = require("./entorno");

// Corrección utilizada en el aula para las consultas DNS de Atlas
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function conectarBaseDatos() {
  try {
    // Lee y valida la URI usando tu módulo de entorno
    const uri = leerUriMongo();

    //  CORRECCIÓN: Se agrega dbName obligatorio y se retorna la conexión
    await mongoose.connect(uri, {
      dbName: "reservas_salas_u7",
      serverSelectionTimeoutMS: 5000,
    });

    return mongoose.connection;
  } catch (error) {
    //  CORRECCIÓN: Diagnóstico seguro sin exponer la contraseña privada en la consola
    console.error(
      `❌ Fallo de conexión: [${error.name}] - Operación: ${error.syscall ?? "N/A"} - Código: ${error.code ?? "N/A"}`,
    );

    //  CORRECCIÓN: Establece código de salida fallido para la terminal
    process.exitCode = 1;
    throw error;
  }
}

async function desconectarBaseDatos() {
  // Cierre limpio de recursos de red exigido para procesos de Node
  await mongoose.disconnect();
}

module.exports = { conectarBaseDatos, desconectarBaseDatos };
