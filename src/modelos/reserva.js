// src/modelos/reserva.js
const mongoose = require("mongoose");

// Listas de valores permitidos
const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidas = ["Mañana", "Tarde", "Noche"];
const estadosPermitidos = ["pendiente", "confirmada"];

// Definición del Esquema con reglas
const reservaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: String,
      required: [true, "El nombre del estudiante es obligatorio."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El correo electrónico es obligatorio."],
      trim: true,
      match: [/@/, "El correo electrónico debe contener un caracter '@'."],
    },
    sala: {
      type: String,
      required: [true, "La sala es obligatoria."],
      enum: {
        values: salasPermitidas,
        message: "Sala no permitida. Opciones: {VALUES}",
      },
    },
    fecha: {
      type: String,
      required: [true, "La fecha es obligatoria."],
      trim: true,
    },
    turno: {
      type: String,
      required: [true, "El turno es obligatorio."],
      enum: {
        values: turnosPermitidas,
        message: "Turno no permitido. Opciones: {VALUES}",
      },
    },
    personas: {
      type: Number,
      required: [true, "La cantidad de personas es obligatoria."],
      validate: {
        validator: function (valor) {
          return Number.isInteger(valor);
        },
        message: "La cantidad de personas debe ser un número entero.",
      },
      min: [1, "El mínimo de personas permitido es 1."],
      max: [6, "El máximo de personas permitido es 6."],
    },
    estado: {
      type: String,
      required: true,
      enum: {
        values: estadosPermitidos,
        message: "Estado no permitido. Opciones: {VALUES}",
      },
      default: "pendiente",
    },
  },
  {
    collection: "reservas", // Asegura que use explícitamente la colección reservas
    versionKey: false,
  },
);

// Construcción y exportación segura del Modelo (evita conflictos de recarga)
const Reserva = mongoose.models.Reserva || mongoose.model("Reserva", reservaSchema);

module.exports = Reserva;