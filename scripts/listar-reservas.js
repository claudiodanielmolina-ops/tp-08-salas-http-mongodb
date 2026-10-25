// scripts/listar-reservas.js
const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reserva");

async function main() {
  try {
    // Abre el canal de comunicación asíncrono con Atlas
    await conectarBaseDatos();

    console.log("=== Leyendo registros de MongoDB Atlas ===");

    // Consulta asíncrona de todos los documentos usando el Modelo
    // lean() optimiza la consulta devolviendo objetos JS puros en lugar de documentos Mongoose pesados
    const reservas = await Reserva.find({}).lean();

    if (reservas.length === 0) {
      console.log("La colección 'reservas' se encuentra vacía actualmente.");
    } else {
      console.log(
        `Se encontraron ${reservas.length} reservas en la base de datos:\n`,
      );

      // Itera e imprime cada documento con un formato prolijo para la consola
      reservas.forEach((reserva, index) => {
        console.log(`[Reserva #${index + 1}]`);
        console.log(`  ID (_id):   ${reserva._id}`);
        console.log(`  Estudiante: ${reserva.estudiante}`);
        console.log(`  Email:      ${reserva.email}`);
        console.log(`  Sala:       ${reserva.sala}`);
        console.log(`  Fecha:      ${reserva.fecha}`);
        console.log(`  Turno:      ${reserva.turno}`);
        console.log(`  Personas:   ${reserva.personas}`);
        console.log("------------------------------------------");
      });
    }
  } catch (error) {
    // Captura fallas imprevistas durante la lectura
    console.error(
      "Ocurrió un error al intentar listar las reservas:",
      error.message,
    );
    process.exitCode = 1;
  } finally {
    // Libera los sockets de red de Node pase lo que pase
    await desconectarBaseDatos();
    console.log("Conexión con MongoDB cerrada de forma limpia.");
  }
}

// Ejecuta el proceso principal
main();
