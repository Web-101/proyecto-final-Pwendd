let pedido = null;

try {
    pedido = JSON.parse(
        sessionStorage.getItem("pedidoCine")
    );
} catch (error) {
    console.error(
        "No se pudo leer el pedido:",
        error
    );
}

const paginaCompras =
    document.querySelector(".pagina-compras");

const formulario =
    document.getElementById("formularioCompra");

const confirmacion =
    document.getElementById("confirmacion");

function pedidoValido() {
    return (
        pedido &&
        Number.isInteger(Number(pedido.peliculaId)) &&
        typeof pedido.pelicula === "string" &&
        pedido.pelicula.trim() !== "" &&
        typeof pedido.sala === "string" &&
        typeof pedido.fecha === "string" &&
        typeof pedido.hora === "string" &&
        Array.isArray(pedido.asientos) &&
        pedido.asientos.length > 0 &&
        Number(pedido.total) > 0
    );
}

function mostrarReservaInexistente() {
    paginaCompras.innerHTML = `
        <section class="resumen-compra">
            <h1>No existe una reserva activa</h1>

            <p>
                Debe seleccionar una película,
                una función y sus butacas antes
                de continuar.
            </p>

            <a href="index.html" class="volver">
                VOLVER A LA CARTELERA
            </a>
        </section>
    `;
}

function cargarResumen() {
    document.getElementById(
        "peliculaResumen"
    ).textContent = pedido.pelicula;

    document.getElementById(
        "funcionResumen"
    ).textContent =
        pedido.sala +
        " · Día " +
        pedido.fecha +
        " · " +
        pedido.hora;

    document.getElementById(
        "asientosResumen"
    ).textContent =
        pedido.asientos.join(", ");

    document.getElementById(
        "totalResumen"
    ).textContent =
        pedido.total + " Bs";

    confirmacion.style.display = "none";
}

function correoValido(correo) {
    const expresion =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresion.test(correo);
}

async function registrarCompra(datosCompra) {
    const respuesta = await fetch(
        "/api/compras",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(datosCompra)
        }
    );

    const resultado =
        await respuesta.json().catch(function () {
            return {};
        });

    if (!respuesta.ok) {
        throw new Error(
            resultado.mensaje ||
            "No se pudo registrar la compra."
        );
    }

    return resultado.compra;
}

function mostrarConfirmacion(compra) {
    document.querySelector(
        ".resumen-compra"
    ).style.display = "none";

    formulario.style.display = "none";
    confirmacion.style.display = "flex";

    document.getElementById(
        "mensajeGracias"
    ).textContent =
        "¡Gracias por tu compra, " +
        compra.nombre +
        "!";

    document.getElementById(
        "tituloTicket"
    ).textContent =
        compra.pelicula;

    document.getElementById(
        "funcionTicket"
    ).textContent =
        compra.sala +
        " · Día " +
        compra.fecha +
        " · " +
        compra.hora;

    document.getElementById(
        "butacasTicket"
    ).textContent =
        compra.asientos.join(", ");

    document.getElementById(
        "totalTicket"
    ).textContent =
        compra.total + " Bs";

    document.getElementById(
        "correoTicket"
    ).textContent =
        compra.correo;

    document.getElementById(
        "telefonoTicket"
    ).textContent =
        compra.telefono === ""
            ? "No registrado"
            : compra.telefono;

    document.getElementById(
        "imagenTicket"
    ).src = compra.foto;

    document.getElementById(
        "imagenTicket"
    ).alt =
        "Póster de " +
        compra.pelicula;
}

if (!pedidoValido()) {
    mostrarReservaInexistente();
} else {
    cargarResumen();

    formulario.addEventListener(
        "submit",
        async function (evento) {
            evento.preventDefault();

            const nombre =
                document
                    .getElementById("nombre")
                    .value
                    .trim();

            const correo =
                document
                    .getElementById("correo")
                    .value
                    .trim();

            const telefono =
                document
                    .getElementById("telefono")
                    .value
                    .trim();

            if (nombre.length < 3) {
                alert(
                    "Ingrese su nombre completo."
                );

                return;
            }

            if (!correoValido(correo)) {
                alert(
                    "Ingrese un correo electrónico válido."
                );

                return;
            }

            const botonEnviar =
                formulario.querySelector(
                    'button[type="submit"]'
                );

            botonEnviar.disabled = true;
            botonEnviar.textContent =
                "PROCESANDO...";

            try {
                const compra =
                    await registrarCompra({
                        ...pedido,
                        nombre: nombre,
                        correo: correo,
                        telefono: telefono
                    });

                sessionStorage.setItem(
                    "ultimaCompra",
                    JSON.stringify(compra)
                );

                sessionStorage.removeItem(
                    "pedidoCine"
                );

                mostrarConfirmacion(compra);
            } catch (error) {
                console.error(error);

                alert(error.message);

                botonEnviar.disabled = false;
                botonEnviar.textContent =
                    "FINALIZAR COMPRA";
            }
        }
    );
}