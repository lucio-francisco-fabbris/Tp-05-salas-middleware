const express = require("express");
const expressLayout = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");

const app = express();

let siguienteSolicitudId = 1;

function identificarSolicitudes(req, res , next) {
    const numero = String(siguienteSolicitudId).padStart(4, "0");

    res.locals.solicitudId = `BIB-${numero}`;

    siguienteSolicitudId++;

    next();
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev"));
app.use(identificarSolicitudes);

app.use(expressLayout);
app.set("layout", "layouts/main");

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false  }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

app.listen(3000, () => {
    console.log("Servidor ejecutandose en http://localhost:3000");
});
