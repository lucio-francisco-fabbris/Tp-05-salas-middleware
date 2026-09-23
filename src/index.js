const express = require("express");
const expressLayout = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");

const app = express();

const reservas = [
    {
        id: 1,
        estudiante: "Lucia Gomez",
        email: "lucia@gmail.com",
        sala: "Sala Norte",
        fecha: "2026-09-01",
        turno: "Mañana",
        personas: 2
    },
    {
    id: 2,
    estudiante: "Mateo Fernández",
    email: "mateo@gmail.com",
    sala: "Sala Sur",
    fecha: "2026-09-02",
    turno: "Tarde",
    personas: 4
    },
    {
    id: 3,
    estudiante: "Sofía Rodríguez",
    email: "sofia@gmail.com",
    sala: "Sala Multimedia",
    fecha: "2026-09-03",
    turno: "Noche",
    personas: 3
    },
    {
    id: 4,
    estudiante: "Tomás López",
    email: "tomas@gmail.com",
    sala: "Sala Norte",
    fecha: "2026-09-04",
    turno: "Mañana",
    personas: 1
    }
];

const reservasRouter = express.Router();



reservasRouter.use((req, res, next) => {
    res.locals.seccion = "Reservas de salas";
    next();
});

reservasRouter.get("/", (req, res) => {
    res.render("reservas/lista", {
        title: "Reservas",
        reservas
    });
});

reservasRouter.post("/", validarReserva, crearReserva);

reservasRouter.get("/nueva", (req, res) => {
    res.render("reservas/nueva", {
        title: "Nueva reserva",
        valores: {},
        error: null
    });
});

reservasRouter.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    const reserva = reservas.find((reserva) => reserva.id === id);

    if (!reserva) {
        return res.status(404).render("no-encontrado", {
            title: "Página no encontrada",
            mensaje: "La reserva solicitada no existe."
        });
    }

    res.render("reservas/detalle", {
        title: "Detalle de reserva",
        reserva
    });
});

let siguienteSolicitudId = 1;

function identificarSolicitudes(req, res , next) {
    const numero = String(siguienteSolicitudId).padStart(4, "0");

    res.locals.solicitudId = `BIB-${numero}`;

    siguienteSolicitudId++;

    next();
}

function medirDuracion(req, res, next) {
    const inicio = Date.now();

    res.on("finish", () => {
        const duracion = Date.now() - inicio;

        console.log(`${res.locals.solicitudId} - ${req.method} - ${req.originalUrl} - ${res.statusCode} - ${duracion} ms `);
    });

    next();

}

function validarReserva(req, res, next) {
    const estudiante = req.body.estudiante;

    if (!estudiante || estudiante.trim() === "") {
    return res.status(400).render("reservas/nueva", {
        title: "Nueva reserva",
        error: "El estudiante es obligatorio",
        valores: req.body
    });
}

    const email = req.body.email;

if (!email || !email.includes("@")) {
    return res.status(400).render("reservas/nueva", {
        title: "Nueva reserva",
        error: "El email no es válido",
        valores: req.body
    });
}
const sala = req.body.sala;

if (
    sala !== "Sala Norte" &&
    sala !== "Sala Sur" &&
    sala !== "Sala Multimedia"
) {
    return res.status(400).render("reservas/nueva", {
        title: "Nueva reserva",
        error: "La sala no es válida",
        valores: req.body
    });
}

const fecha = req.body.fecha;

if (!fecha || fecha.trim() === "") {
    return res.status(400).render("reservas/nueva", {
        title: "Nueva reserva",
        error: "La fecha es obligatoria",
        valores: req.body
    });
}

const turno = req.body.turno;

if (
    turno !== "Mañana" &&
    turno !== "Tarde" &&
    turno !== "Noche"
) {
    return res.status(400).render("reservas/nueva", {
        title: "Nueva reserva",
        error: "El turno no es válido",
        valores: req.body
    });
}

const personas = Number(req.body.personas);

if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    return res.status(400).render("reservas/nueva", {
        title: "Nueva reserva",
        error: "La cantidad de personas debe ser un número entero entre 1 y 6",
        valores: req.body
    });
}

req.reservaValidada = {
    estudiante: estudiante.trim(),
    email: email.trim(),
    sala,
    fecha: fecha.trim(),
    turno,
    personas
};

    next();
}

function crearReserva(req, res) {
    const nuevaReserva = {
        id: reservas.length + 1,
        ...req.reservaValidada
    };

    reservas.push(nuevaReserva);

    res.redirect("/reservas");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,  "..", "views"));

app.use(morgan("dev"));
app.use(identificarSolicitudes);
app.use(medirDuracion);

app.use(expressLayout);
app.set("layout", "layouts/main");

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false  }));
app.use(express.json());

app.use("/reservas", reservasRouter);

app.get("/", (req, res) => {
    res.render("inicio", {
        title: "Inicio"
    });
});

app.get("/estado", (req, res) => {
    res.json({
        servicio:"activo",
        reservas: reservas.length,
        solicitudId: res.locals.solicitudId
    });
});

app.use((req, res) => {
    res.status(404).render("no-encontrado", {
        title: "Página no encontrada",
        mensaje: "La dirección solicitada no existe."
    });
});

app.listen(3000, () => {
    console.log("Servidor ejecutandose en http://localhost:3000");
});
