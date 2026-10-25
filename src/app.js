
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");
const {
  identificarSolicitud,
  medirDuracion,
} = require("./middleware/solicitudes");
const crearControladorReservas = require("./controladores/reservas");
const crearRouterReservas = require("./rutas/reservas");
const crearRouterApiReservas = require("./rutas/api-reservas");

function crearApp({ servicioReservas, formatoRegistro }) {
  const app = express();
  const controladorReservas = crearControladorReservas(servicioReservas);

  // Enrutadores separados (HTML y API)
  const reservasRouter = crearRouterReservas(controladorReservas);
  const apiReservasRouter = crearRouterApiReservas(controladorReservas);

  // Configuración de vistas y layouts
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.use(expressLayouts);
  app.set("layout", "layouts/main");

  // Pipeline global de middlewares
  app.use(morgan(formatoRegistro));
  app.use(identificarSolicitud);
  app.use(medirDuracion);

  // Archivos estáticos y parsers
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Rutas globales
  app.get("/", (req, res) => {
    res.render("inicio", { titulo: "Reserva de salas de estudio" });
  });

  // Ruta /estado actualizada con conteo asíncrono desde MongoDB
  app.get("/estado", async (req, res, next) => {
    try {
      const totalReservas = await servicioReservas.contar();
      res.json({
        servicio: "activo",
        reservas: totalReservas,
        solicitudId: res.locals.solicitudId,
      });
    } catch (error) {
      next(error);
    }
  });

  // Montaje de enrutadores
  app.use("/reservas", reservasRouter);
  app.use("/api/reservas", apiReservasRouter);

  // Manejador 404 global (soporta HTML y JSON según la solicitud)
  app.use((req, res) => {
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(404).json({ error: "Recurso o ruta de API no encontrada." });
    }
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      mensaje: "La dirección solicitada no existe.",
    });
  });

  // Middleware global de manejo de errores (Exactamente 4 parámetros: err, req, res, next)
  app.use((err, req, res, next) => {
    console.error("Error interno capturado:", err.message);

    const statusCode = err.status || 500;

    // Si es una petición a la API, responde estrictamente en JSON sin exponer trazas
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(statusCode).json({
        error: statusCode === 500 ? "Fallo inesperado durante la operación." : err.message,
      });
    }

    // Respuesta HTML para el sitio web
    res.status(statusCode).render("no-encontrado", {
      titulo: "Error en el servidor",
      mensaje: statusCode === 500 ? "Ocurrió un error inesperado en el servidor." : err.message,
    });
  });

  return app;
}

module.exports = crearApp;