// src/servicios/reservas.js
const Reserva = require("../modelos/reserva");

function crearServicioReservas() {
  // Lista todas las reservas o filtra por criterio (ej: { sala: "Sala Norte" })
  async function listar(filtro = {}) {
    return await Reserva.find(filtro);
  }

  // Busca una reserva por su ID de MongoDB
  async function obtenerPorId(id) {
    return await Reserva.findById(id);
  }

  // Crea y guarda una nueva reserva en la base de datos
  async function crear(datosValidados) {
    // Copia explícitamente solo los campos permitidos y asegura el estado por defecto
    const nuevaReserva = new Reserva({
      estudiante: datosValidados.estudiante,
      email: datosValidados.email,
      sala: datosValidados.sala,
      fecha: datosValidados.fecha,
      turno: datosValidados.turno,
      personas: datosValidados.personas,
      estado: "pendiente", // Default requerido por el TP 08
    });

    return await nuevaReserva.save();
  }

  // Cuenta la cantidad total de documentos en la colección para la ruta /estado
  async function contar() {
    return await Reserva.countDocuments();
  }

  return { listar, obtenerPorId, crear, contar };
}

module.exports = crearServicioReservas;