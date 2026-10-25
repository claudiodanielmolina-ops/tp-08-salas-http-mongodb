# Trabajo Práctico 08 - Endpoints Persistentes de Reservas de Salas

## 1. Origen y Versiones
* **Origen de la copia:** Trabajo Práctico 07 (`tp-07-salas-http-mongodb`).
* **Versiones del entorno y dependencias clave:**
  * **Node.js:** v24.19.0 (o versión activa en el sistema).
  * **Express:** `5.3.0`
  * **Mongoose:** `9.11.2`
  * **Dotenv:** `17.x.x`
  * **Manejo de módulos:** CommonJS (`require` / `module.exports`).



## 2. Preparación de MongoDB Atlas, Entorno y Red
* **Clúster:** MongoDB Atlas Free Tier (M0).
* **Base de datos:** `reservas_salas_u8`
* **Colección:** `reservas`
* **Variables de entorno (.env):**
  Las variables se gestionan de forma privada mediante el paquete `dotenv`. La plantilla `.env.example` contiene la estructura sin credenciales reales:
  ```env
  PORT=3000
  NODE_ENV=development
  MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.xxx.mongodb.net/reservas_salas_u8

  * Ajustes de DNS y Red: Se mantiene la resolución DNS estándar habilitada por el conector nativo de Mongoose sin duplicar reconexiones por solicitud HTTP. 
  
 

3. Comando de Inicio y Ejecución
Para iniciar el servidor localmente ejecutando la lectura de variables de entorno e iniciando la conexión persistente con MongoDB Atlas:

# Instalación de dependencias
npm install

# Comando de inicio
npm start

* El script principal lee las variables del .env, aguarda la conexión exitosa a MongoDB Atlas y, una vez establecida, habilita el servidor HTTP en http://localhost:3000

4. Estructura por Capas del Proyecto

tp-08-salas-http-mongodb/
├── config/
│   └── entorno.js         # Lectura y validación de variables de entorno
├── modelos/
│   └── reserva.js         # Esquema Mongoose con tipos, validaciones y defaults
├── servicios/
│   └── reservas.js        # Servicio asíncrono desacoplado (operaciones CRUD con MongoDB)
├── controladores/
│   ├── reservas.js        # Controlador de renderizado HTML
│   └── api-reservas.js    # Controlador para respuestas de la API REST (JSON)
├── rutas/
│   ├── reservas.js        # Router de páginas y vistas HTML
│   └── api-reservas.js    # Router aislado de la API REST JSON (/api/reservas)
├── views/                 # Plantillas HTML/EJS de la interfaz
├── public/                # Archivos estáticos (CSS, JS cliente, imágenes)
├── app.js                 # Configuración de Express, middlewares y rutas
├── index.js               # Punto de entrada principal (arranque asíncrono y graceful shutdown)
└── .env                   # Variables de entorno (excluido del control de versiones)

5. Tabla de Endpoints de la API JSON

Método,            URL/Endpoint,                         Descripción/Comportamiento                                 Respuesta de Éxito
GET,               /api/reservas,                        Devuelve el listado completo de reservas.,                 200 OK (Arreglo JSON)
GET,               /api/reservas?sala=Sala%20Norte,      Filtra exactamente por el nombre de la sala.,              200 OK (Arreglo de coincidencias)
GET,               /api/reservas/:id,                    Recupera el detalle individual de una reserva por su ID.,  200 OK (Objeto JSON)
POST,              /api/reservas,                        "Crea una nueva reserva (asigna default estado: 
                                                         ""pendiente"").",                                          201 Created + Header Location

6. JSON de Ejemplo de solicitud y respuesta

{
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-21",
  "turno": "Mañana",
  "personas": 2
}


Respuesta del Servidor (201 Created):
Cabecera de respuesta: Location: /api/reservas/6ade7d6b9ab99eb4f03115af

Cuerpo JSON:

{
  "id": "6ade7d6b9ab99eb4f03115af",
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-21",
  "turno": "Mañana",
  "personas": 2,
  "estado": "pendiente"
}

7. Instrucciones para Reproducir las Solicitudes en Postman
Listado Inicial (GET):

URL: http://localhost:3000/api/reservas

Body: none

Respuesta: 200 OK y arreglo JSON.

Creación de Reserva (POST):

URL: http://localhost:3000/api/reservas

Headers: Content-Type: application/json

Body: raw -> JSON con los 6 campos requeridos.

Respuesta: 201 Created, recurso guardado con su id y cabecera Location.

Consulta por ID (GET):

URL: Utilizar la ruta enviada en Location (ej: http://localhost:3000/api/reservas/6ade7d6b9ab99eb4f03115af).

Body: none

Respuesta: 200 OK con la representación exacta del recurso.

Filtro por Sala (GET con Query Parameters):

URL: http://localhost:3000/api/reservas

Params: Key: sala, Value: Sala Norte

Respuesta: 200 OK con las coincidencias exactas.

Pruebas Negativas y Validaciones (POST / GET erróneos):

Enviar cuerpos vacíos o JSONs incompletos para verificar respuestas 400 Bad Request.

Enviar IDs mal formados (ej: /api/reservas/1) para verificar respuestas 400 Bad Request.

Enviar IDs inexistentes bien formados para verificar respuestas 404 Not Found.

8. Matriz de Resultados Observados

Caso / Escenario,                                  Resultado Esperado,                                             Resultado Observado,Estado
Listado inicial (base nueva/existente),            200 OK,200 OK,                                                           PASÓ
Creación válida con POST,                          201 Created + Header Location,201 Created con Location correcto,         PASÓ
Consulta por ID recién creado,                     200 OK con el recurso,200 OK idéntico,                                   PASÓ
Consulta de recurso tras reiniciar el servidor,    200 OK (Persistencia comprobada),200 OK idéntico,                        PASÓ
ID mal formado (/api/reservas/1),400 Bad Request,  400 Bad Request JSON,                                                    PASÓ
ID inexistente válido (000000000000000000000000),  404 Not Found,404 Not Found JSON,                                        PASÓ
POST con entrada inválida / cuerpo ausente,        400 Bad Request,400 Bad Request sin escritura,                           PASÓ
"Envío de campos extra (estado: ""confirmada"")",  Se ignora y asigna pendiente,"Crea con estado: ""pendiente""",           PASÓ
Filtro exacto por sala (?sala=Sala Norte),         Coincidencias exactas,Retorna únicamente registros de esa sala,          PASÓ


9. Prueba de Reinicio y Persistencia
Se realizó la creación de un registro de prueba vía POST.

Se detuvo la ejecución del servidor Node.js en la terminal (Ctrl + C).

Se volvió a arrancar el servicio con npm start.

Se consultó nuevamente vía GET /api/reservas/:id obteniendo el mismo registro con estado 200 OK, demostrando que los datos residen de forma persistente en MongoDB Atlas y no en la memoria volátil del proceso.

10. Límites de Validación
Sanitización de campos: Se copian explícitamente solo los 6 campos admitidos (estudiante, email, sala, fecha, turno, personas), ignorando intentos de inyección de campos no permitidos o modificación directa del estado.

Reglas de esquema:

estudiante: String obligatorio.

email: String obligatorio con validación de presencia del caracter @.

sala: Enum restringido a Sala Norte, Sala Sur, Sala Multimedia.

turno: Enum restringido a Mañana, Tarde, Noche.

personas: Entero estricto entre 1 y 6.

estado: Asignado automáticamente como "pendiente" por Mongoose.

11. Comparación con el TP 07 y Desacoplamiento de la Semilla Volátil

TP 07: Almacenaba las reservas en un arreglo en memoria e importaba una semilla JSON para inicializar o restaurar datos al reiniciar el servidor.

TP 08: La semilla estática y los arreglos en memoria fueron retirados de las importaciones activas del ciclo de vida. El servicio crearServicioReservas opera directamente mediante promesas asíncronas sobre el modelo de Mongoose y MongoDB Atlas.

Consistencia: Tanto el router de páginas HTML como el router de la API JSON consumen la misma instancia del servicio asíncrono, garantizando que el sitio web y la API compartan la misma fuente unificada de datos.






