const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const rutaPeliculas = path.join(
    __dirname,
    "data",
    "detalle.json"
);

const rutaCompras = path.join(
    __dirname,
    "data",
    "compras.json"
);

function leerJson(ruta, valorPredeterminado = []) {
    try {
        if (!fs.existsSync(ruta)) {
            fs.writeFileSync(
                ruta,
                JSON.stringify(valorPredeterminado, null, 2),
                "utf-8"
            );

            return valorPredeterminado;
        }

        const contenido = fs.readFileSync(ruta, "utf-8");

        if (contenido.trim() === "") {
            return valorPredeterminado;
        }

        return JSON.parse(contenido);
    } catch (error) {
        console.error(
            "Error al leer el archivo:",
            ruta,
            error.message
        );

        return valorPredeterminado;
    }
}

function guardarJson(ruta, datos) {
    fs.writeFileSync(
        ruta,
        JSON.stringify(datos, null, 2),
        "utf-8"
    );
}

function limpiarTextoHtml(texto) {
    return String(texto || "")
        .replace(/<[^>]*>/g, "")
        .trim();
}

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/cartelera", function (req, res) {
    const peliculas = leerJson(rutaPeliculas);

    res.json(peliculas);
});

app.get("/api/cartelera/:id", function (req, res) {
    const id = Number(req.params.id);
    const peliculas = leerJson(rutaPeliculas);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: "El identificador de la película no es válido."
        });
    }

    const pelicula = peliculas.find(function (elemento) {
        return elemento.id === id;
    });

    if (!pelicula) {
        return res.status(404).json({
            mensaje: "Película no encontrada."
        });
    }

    res.json(pelicula);
});

app.get("/api/butacas-ocupadas", function (req, res) {
    const peliculaId = Number(req.query.peliculaId);
    const sala = String(req.query.sala || "").trim();
    const fecha = String(req.query.fecha || "").trim();
    const hora = String(req.query.hora || "").trim();

    if (
        !Number.isInteger(peliculaId) ||
        peliculaId <= 0 ||
        sala === "" ||
        fecha === "" ||
        hora === ""
    ) {
        return res.status(400).json({
            mensaje: "Los datos de la función no están completos."
        });
    }

    const compras = leerJson(rutaCompras);

    const butacasOcupadas = compras
        .filter(function (compra) {
            return (
                compra.peliculaId === peliculaId &&
                compra.sala === sala &&
                compra.fecha === fecha &&
                compra.hora === hora
            );
        })
        .flatMap(function (compra) {
            return compra.asientos;
        });

    res.json({
        asientos: [...new Set(butacasOcupadas)]
    });
});

app.post("/api/compras", function (req, res) {
    const {
        peliculaId,
        sala,
        fecha,
        hora,
        asientos,
        total,
        nombre,
        correo,
        telefono
    } = req.body;

    const idNumerico = Number(peliculaId);
    const totalNumerico = Number(total);

    if (
        !Number.isInteger(idNumerico) ||
        idNumerico <= 0 ||
        typeof sala !== "string" ||
        typeof fecha !== "string" ||
        typeof hora !== "string" ||
        !Array.isArray(asientos) ||
        asientos.length === 0 ||
        !Number.isFinite(totalNumerico) ||
        totalNumerico <= 0 ||
        typeof nombre !== "string" ||
        nombre.trim() === "" ||
        typeof correo !== "string" ||
        correo.trim() === ""
    ) {
        return res.status(400).json({
            mensaje: "Los datos de la compra están incompletos."
        });
    }

    const peliculas = leerJson(rutaPeliculas);

    const pelicula = peliculas.find(function (elemento) {
        return elemento.id === idNumerico;
    });

    if (!pelicula) {
        return res.status(404).json({
            mensaje: "La película seleccionada no existe."
        });
    }

    const compras = leerJson(rutaCompras);

    const butacasOcupadas = compras
        .filter(function (compra) {
            return (
                compra.peliculaId === idNumerico &&
                compra.sala === sala &&
                compra.fecha === fecha &&
                compra.hora === hora
            );
        })
        .flatMap(function (compra) {
            return compra.asientos;
        });

    const butacasRepetidas = asientos.filter(function (asiento) {
        return butacasOcupadas.includes(asiento);
    });

    if (butacasRepetidas.length > 0) {
        return res.status(409).json({
            mensaje:
                "Las siguientes butacas ya fueron reservadas: " +
                butacasRepetidas.join(", ")
        });
    }

    const nuevaCompra = {
        id: Date.now(),
        peliculaId: idNumerico,
        pelicula: limpiarTextoHtml(pelicula.titulo),
        foto: pelicula.foto,
        sala: sala.trim(),
        fecha: fecha.trim(),
        hora: hora.trim(),
        asientos: asientos,
        total: totalNumerico,
        nombre: nombre.trim(),
        correo: correo.trim(),
        telefono:
            typeof telefono === "string"
                ? telefono.trim()
                : "",
        fechaRegistro: new Date().toISOString()
    };

    compras.push(nuevaCompra);
    guardarJson(rutaCompras, compras);

    res.status(201).json({
        mensaje: "Compra registrada correctamente.",
        compra: nuevaCompra
    });
});

app.use(function (req, res) {
    res.status(404).json({
        mensaje: "Ruta no encontrada."
    });
});

app.use(function (error, req, res, next) {
    console.error(error);

    res.status(500).json({
        mensaje: "Ocurrió un error interno en el servidor."
    });
});

app.listen(PORT, function () {
    console.log(
        "Servidor corriendo en http://localhost:" + PORT
    );
});