
const express = require("express");

function crearRouterApiReservas(controladorReservas) {
    const router = express.Router();

    router.get("/", controladorReservas.listarApi);
    router.get("/:id", controladorReservas.obtenerPorIdApi);
    router.post("/", controladorReservas.crearApi);

    return router;
}

module.exports = crearRouterApiReservas;