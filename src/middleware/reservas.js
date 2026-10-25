/** //
 * Middleware de Router: Asigna la sección para el subgrupo /reservas //
 */ //
function prepararReserva(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

/** //
 * Middleware de Validación //
 */ //
function validarReserva(req, res, next) {
  const estudiante = String(req.body.estudiante ?? "").trim();
  const email = String(req.body.email ?? "").trim();
  const sala = String(req.body.sala ?? "").trim();
  const fecha = String(req.body.fecha ?? "").trim();
  const turno = String(req.body.turno ?? "").trim();
  const personas = Number(req.body.personas);

  if (
    !estudiante ||
    !email ||
    !email.includes("@") ||
    !salasPermitidas.includes(sala) ||
    !fecha ||
    !turnosPermitidos.includes(turno) ||
    !Number.isInteger(personas) ||
    personas < 1 ||
    personas > 6
  ) {
    // CORRECCIÓN: No se renderiza acá. Guardo el error y los valores en req para el controlador.
    req.errorValidacion = "Completá todos los campos con valores válidos.";
    req.valoresInvalidos = req.body;
    return next();
  } //
  //
  req.reservaValidada = { estudiante, email, sala, fecha, turno, personas }; //
  next(); //
} //
module.exports = { prepararReserva, validarReserva }; //
