const parametros =
    new URLSearchParams(window.location.search);

const id = Number(parametros.get("id"));
const hora = parametros.get("hora");
const sala = parametros.get("sala");
const fecha = parametros.get("fecha");

const precio =
    sala === "IMAX 3D" ? 35 : 25;

let pelicula = null;

const seleccionadas = [];

const botonContinuar =
    document.getElementById("continuarCompras");

function quitarEtiquetas(texto) {
    const elemento = document.createElement("div");
    elemento.innerHTML = texto;

    return elemento.textContent.trim();
}

function parametrosValidos() {
    return (
        Number.isInteger(id) &&
        id > 0 &&
        typeof hora === "string" &&
        hora.trim() !== "" &&
        typeof sala === "string" &&
        sala.trim() !== "" &&
        typeof fecha === "string" &&
        fecha.trim() !== ""
    );
}

function mostrarError(mensaje) {
    const principal =
        document.querySelector(".pagina-butaca");

    if (principal) {
        principal.innerHTML = `
            <section class="mensaje-error">
                <h2>No se pudo cargar la función</h2>
                <p>${mensaje}</p>
                <a href="index.html">
                    Volver a la cartelera
                </a>
            </section>
        `;
    }
}

function obtenerButacasBase() {
    const todosLosCodigos = Array.from(
        document.querySelectorAll(".butaca")
    ).map(function (butaca) {
        return butaca.textContent.trim();
    });

    if (todosLosCodigos.length === 0) {
        return [];
    }

    const clave =
        id + "-" + sala + "-" + fecha + "-" + hora;

    let semilla = 0;

    for (
        let posicion = 0;
        posicion < clave.length;
        posicion++
    ) {
        semilla =
            (semilla * 31 +
                clave.charCodeAt(posicion)) >>>
            0;
    }

    const butacasMezcladas = [
        ...todosLosCodigos
    ];

    function numeroAleatorio() {
        semilla =
            (semilla * 1664525 + 1013904223) >>>
            0;

        return semilla / 4294967296;
    }

    for (
        let posicion =
            butacasMezcladas.length - 1;
        posicion > 0;
        posicion--
    ) {
        const posicionAleatoria = Math.floor(
            numeroAleatorio() *
            (posicion + 1)
        );

        const temporal =
            butacasMezcladas[posicion];

        butacasMezcladas[posicion] =
            butacasMezcladas[
            posicionAleatoria
            ];

        butacasMezcladas[
            posicionAleatoria
        ] = temporal;
    }

    const cantidadOcupadas = Math.min(
        8,
        butacasMezcladas.length
    );

    return butacasMezcladas.slice(
        0,
        cantidadOcupadas
    );
}

async function obtenerButacasCompradas() {
    const consulta = new URLSearchParams({
        peliculaId: String(id),
        sala: sala,
        fecha: fecha,
        hora: hora
    });

    const respuesta = await fetch(
        "/api/butacas-ocupadas?" +
        consulta.toString()
    );

    if (!respuesta.ok) {
        throw new Error(
            "No se pudieron consultar las butacas ocupadas."
        );
    }

    const datos = await respuesta.json();

    return Array.isArray(datos.asientos)
        ? datos.asientos
        : [];
}

function marcarButacasOcupadas(codigos) {
    document
        .querySelectorAll(".butaca")
        .forEach(function (butaca) {
            const codigo =
                butaca.textContent.trim();

            butaca.classList.remove(
                "ocupada",
                "seleccionada"
            );

            if (codigos.includes(codigo)) {
                butaca.classList.add("ocupada");
            }
        });
}

async function cargarPelicula() {
    if (!parametrosValidos()) {
        mostrarError(
            "La película, fecha, sala u horario no son válidos."
        );

        return;
    }

    try {
        const respuesta = await fetch(
            "/api/cartelera/" +
            encodeURIComponent(id)
        );

        if (!respuesta.ok) {
            const datosError =
                await respuesta.json().catch(function () {
                    return {};
                });

            throw new Error(
                datosError.mensaje ||
                "No se pudo cargar la película."
            );
        }

        pelicula = await respuesta.json();

        document.getElementById(
            "tituloPelicula"
        ).innerHTML = pelicula.titulo;

        document.getElementById(
            "infoFuncion"
        ).textContent =
            sala + " · Día " + fecha + " · " + hora;

        document.getElementById(
            "posterPelicula"
        ).src = pelicula.foto;

        document.getElementById(
            "posterPelicula"
        ).alt =
            "Póster de " +
            quitarEtiquetas(pelicula.titulo);

        document.getElementById(
            "nombreResumen"
        ).innerHTML = pelicula.titulo;

        document.getElementById(
            "detalleResumen"
        ).textContent =
            sala + " · Día " + fecha + " · " + hora;

        const butacasBase = obtenerButacasBase();
        const butacasCompradas =
            await obtenerButacasCompradas();

        const ocupadas = [
            ...new Set([
                ...butacasBase,
                ...butacasCompradas
            ])
        ];

        marcarButacasOcupadas(ocupadas);
        seleccionarButacas();
        actualizarResumen();
    } catch (error) {
        console.error(error);
        mostrarError(error.message);
    }
}

function seleccionarButacas() {
    const butacas =
        document.querySelectorAll(".butaca");

    butacas.forEach(function (butaca) {
        if (butaca.dataset.configurada === "true") {
            return;
        }

        butaca.dataset.configurada = "true";

        butaca.addEventListener(
            "click",
            function () {
                if (
                    butaca.classList.contains("ocupada")
                ) {
                    return;
                }

                const codigo =
                    butaca.textContent.trim();

                if (
                    butaca.classList.contains(
                        "seleccionada"
                    )
                ) {
                    butaca.classList.remove(
                        "seleccionada"
                    );

                    const posicion =
                        seleccionadas.indexOf(codigo);

                    if (posicion !== -1) {
                        seleccionadas.splice(
                            posicion,
                            1
                        );
                    }
                } else {
                    butaca.classList.add(
                        "seleccionada"
                    );

                    seleccionadas.push(codigo);
                }

                actualizarResumen();
            }
        );
    });
}

function actualizarResumen() {
    document.getElementById(
        "butacasSeleccionadas"
    ).textContent =
        seleccionadas.length > 0
            ? seleccionadas.join(", ")
            : "Ninguna";

    const total =
        seleccionadas.length * precio;

    document.getElementById("total").textContent =
        total + " Bs";

    botonContinuar.disabled =
        seleccionadas.length === 0 ||
        pelicula === null;
}

botonContinuar.addEventListener(
    "click",
    function () {
        if (!pelicula || seleccionadas.length === 0) {
            alert(
                "Debe seleccionar al menos una butaca."
            );

            return;
        }

        const pedido = {
            peliculaId: pelicula.id,

            pelicula: quitarEtiquetas(
                pelicula.titulo
            ),

            foto: pelicula.foto,
            sala: sala,
            fecha: fecha,
            hora: hora,

            asientos: [...seleccionadas],

            precioUnitario: precio,

            total:
                seleccionadas.length * precio
        };

        sessionStorage.setItem(
            "pedidoCine",
            JSON.stringify(pedido)
        );

        window.location.href = "compras.html";
    }
);

actualizarResumen();
cargarPelicula();