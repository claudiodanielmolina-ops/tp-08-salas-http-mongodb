// src/controladores/reservas.js
const mongoose = require("mongoose");

function crearControladorReservas(servicioReservas) {
  // ==========================================
  // MÓDULO WEB (HTML)
  // ==========================================

  async function listar(req, res, next) {
    try {
      const reservas = await servicioReservas.listar();
      res.render("reservas/lista", {
        titulo: "Reservas de turnos",
        reservas,
      });
    } catch (error) {
      next(error);
    }
  }

  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: null,
      valores: {},
    });
  }

  async function mostrarDetalle(req, res, next) {
    try {
      const id = req.params.id;

      // Validación de formato ObjectId para evitar fallos de Mongoose
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).render("no-encontrado", {
          titulo: "ID inválido",
          mensaje: "El identificador proporcionado no tiene un formato válido.",
        });
      }

      const reserva = await servicioReservas.obtenerPorId(id);

      if (!reserva) {
        return res.status(404).render("no-encontrado", {
          titulo: "Reserva no encontrada",
          mensaje: "No existe esa reserva.",
        });
      }

      res.render("reservas/detalle", {
        titulo: reserva.estudiante,
        reserva,
      });
    } catch (error) {
      next(error);
    }
  }

  async function crear(req, res, next) {
    try {
      // Manejo del error de validación del middleware que ya tenías
      if (req.errorValidacion) {
        return res.status(400).render("reservas/nueva", {
          titulo: "Nueva reserva",
          error: req.errorValidacion,
          valores: req.valoresInvalidos,
        });
      }

      // Creación asíncrona en la base de datos
      await servicioReservas.crear(req.reservaValidada);
      res.redirect("/reservas");
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).render("reservas/nueva", {
          titulo: "Nueva reserva",
          error: error.message,
          valores: req.body,
        });
      }
      next(error);
    }
  }

  // ==========================================
  // MÓDULO API JSON (REST)
  // ==========================================

  async function listarApi(req, res, next) {
    try {
      let filtro = {};

      // Validación de parámetro repetido y filtro exacto por sala
      if (req.query.sala !== undefined) {
        if (Array.isArray(req.query.sala)) {
          return res.status(400).json({ error: "El parámetro 'sala' no puede repetirse." });
        }
        filtro.sala = req.query.sala;
      }

      const reservas = await servicioReservas.listar(filtro);

      // Representación limpia con ID textual
      const resultado = reservas.map((r) => ({
        id: r._id.toString(),
        estudiante: r.estudiante,
        email: r.email,
        sala: r.sala,
        fecha: r.fecha,
        turno: r.turno,
        personas: r.personas,
        estado: r.estado,
      }));

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async function obtenerPorIdApi(req, res, next) {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID mal formado." });
      }

      const reserva = await servicioReservas.obtenerPorId(id);

      if (!reserva) {
        return res.status(404).json({ error: "Recurso no encontrado." });
      }

      res.status(200).json({
        id: reserva._id.toString(),
        estudiante: reserva.estudiante,
        email: reserva.email,
        sala: reserva.sala,
        fecha: reserva.fecha,
        turno: reserva.turno,
        personas: reserva.personas,
        estado: reserva.estado,
      });
    } catch (error) {
      next(error);
    }
  }

  async function crearApi(req, res, next) {
    try {
      // Validar cuerpo ausente o malformado
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Cuerpo de solicitud ausente o malformado." });
      }

      const reservaGuardada = await servicioReservas.crear(req.body);
      const recursoId = reservaGuardada._id.toString();

      // Configurar cabecera Location y estado 201 Created
      res.setHeader("Location", `/api/reservas/${recursoId}`);
      res.status(201).json({
        id: recursoId,
        estudiante: reservaGuardada.estudiante,
        email: reservaGuardada.email,
        sala: reservaGuardada.sala,
        fecha: reservaGuardada.fecha,
        turno: reservaGuardada.turno,
        personas: reservaGuardada.personas,
        estado: reservaGuardada.estado,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  return {
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
    listarApi,
    obtenerPorIdApi,
    crearApi,
  };
}

module.exports = crearControladorReservas;