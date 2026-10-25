
// Cargar dotenv al inicio absoluto para que lea el archivo .env
require("dotenv").config();
const mongoose = require("mongoose");
const { leerConfiguracion } = require("./config/entorno");
const crearServicioReservas = require("./servicios/reservas");
const crearApp = require("./app");

async function main() {
  // 1. Leer la configuración del entorno (me tengo que asegurar de que leerConfiguracion retorne mongoUri o la propiedad correspondiente de .env)
  const config = leerConfiguracion();
  const puerto = config.puerto;
  const mongoUri = config.mongoUri || process.env.MONGODB_URI;
  const formatoRegistro = config.formatoRegistro;

  if (!mongoUri) {
    throw new Error("La URI de MongoDB no está definida en las variables de entorno.");
  }

  // 2. Esperar la conexión a MongoDB Atlas ANTES de abrir el puerto HTTP
  console.log("Conectando a MongoDB Atlas...");
  await mongoose.connect(mongoUri);
  console.log("¡Conexión exitosa a MongoDB Atlas!");

  // 3. Instanciar el servicio asíncrono de reservas (sin semillas en memoria)
  const servicioReservas = crearServicioReservas();

  // 4. Crear la aplicación Express
  const app = crearApp({ servicioReservas, formatoRegistro });

  // 5. Iniciar la escucha del servidor
  const servidor = app.listen(puerto, () => {
    console.log(`Aplicación disponible en http://localhost:${puerto}`);
  });

  // 6. Cierre ordenado (Graceful Shutdown) ante SIGINT y SIGTERM
  const cerrarServidor = async (senal) => {
    console.log(`\nRecibida señal ${senal}. Cerrando servidor HTTP y desconectando de MongoDB...`);
    servidor.close(async () => {
      try {
        await mongoose.connection.close();
        console.log("Conexión a MongoDB cerrada correctamente.");
        process.exit(0);
      } catch (err) {
        console.error("Error al cerrar la conexión a MongoDB:", err);
        process.exit(1);
      }
    });
  };

  process.on("SIGINT", () => cerrarServidor("SIGINT"));
  process.on("SIGTERM", () => cerrarServidor("SIGTERM"));
}

// Punto de entrada seguro con manejo de errores de arranque
main().catch((error) => {
  console.error("No se pudo iniciar la aplicación:", error.message);
  process.exitCode = 1;
});