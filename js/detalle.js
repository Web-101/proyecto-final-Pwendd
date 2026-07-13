const parametros =
    new URLSearchParams(window.location.search);

const id = Number(parametros.get("id"));

let fechaSeleccionada = null;

function mostrarError(mensaje) {
    const principal =
        document.querySelector("main");

    if (principal) {
        principal.innerHTML = `
            <section class="mensaje-error">
                <h2>No se pudo abrir la película</h2>
                <p>${mensaje}</p>
                <a href="index.html">
                    Volver a la cartelera
                </a>
            </section>
        `;
    }
}

function validarId() {
    if (!Number.isInteger(id) || id <= 0) {
        mostrarError(
            "El identificador de la película no es válido."
        );

        return false;
    }

    return true;
}

async function cargarDetalle() {
    if (!validarId()) {
        return;
    }

    try {
        const respuesta = await fetch(
            "/api/cartelera/" +
            encodeURIComponent(id)
        );

        if (!respuesta.ok) {
            const errorServidor =
                await respuesta.json().catch(function () {
                    return {};
                });

            throw new Error(
                errorServidor.mensaje ||
                "No se pudo cargar la película."
            );
        }

        const pelicula = await respuesta.json();

        document.getElementById("foto").src =
            pelicula.foto;

        document.getElementById("foto").alt =
            "Póster de " +
            quitarEtiquetas(pelicula.titulo);

        document.getElementById("titulo").innerHTML =
            pelicula.titulo;

        document.getElementById(
            "descripcion-corta"
        ).textContent = pelicula.descripcionCorta;

        document.getElementById(
            "descripcion"
        ).textContent = pelicula.descripcion;

        document.getElementById("director").textContent =
            pelicula.director;

        document.getElementById("genero").textContent =
            pelicula.genero;

        document.getElementById(
            "calificacion"
        ).textContent = pelicula.calificacion;

        document.getElementById("audio").textContent =
            pelicula.audio;

        cargarHorarios(
            pelicula.imax,
            "horariosImax",
            "IMAX 3D"
        );

        cargarHorarios(
            pelicula.digital,
            "horariosDigital",
            "DIGITAL 2D"
        );
    } catch (error) {
        console.error(error);
        mostrarError(error.message);
    }
}

function quitarEtiquetas(texto) {
    const elemento = document.createElement("div");
    elemento.innerHTML = texto;

    return elemento.textContent.trim();
}

function cargarHorarios(
    horarios,
    contenedorId,
    sala
) {
    const contenedor =
        document.getElementById(contenedorId);

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    if (!Array.isArray(horarios) || horarios.length === 0) {
        contenedor.innerHTML =
            "<p>No existen horarios disponibles.</p>";

        return;
    }

    horarios.forEach(function (hora) {
        const boton =
            document.createElement("button");

        boton.type = "button";
        boton.textContent = hora;
        boton.classList.add("boton-horario");

        boton.addEventListener(
            "click",
            function () {
                if (!fechaSeleccionada) {
                    alert(
                        "Primero debe seleccionar una fecha."
                    );

                    return;
                }

                const parametrosFuncion =
                    new URLSearchParams({
                        id: String(id),
                        hora: hora,
                        sala: sala,
                        fecha: fechaSeleccionada
                    });

                window.location.href =
                    "butaca.html?" +
                    parametrosFuncion.toString();
            }
        );

        contenedor.appendChild(boton);
    });
}

function seleccionarFecha() {
    const botones =
        document.querySelectorAll(".boton-fecha");

    if (botones.length === 0) {
        return;
    }

    botones.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                botones.forEach(
                    function (otroBoton) {
                        otroBoton.classList.remove(
                            "activo"
                        );
                    }
                );

                boton.classList.add("activo");

                fechaSeleccionada =
                    boton.dataset.fecha;
            }
        );
    });

    botones[0].click();
}

seleccionarFecha();
cargarDetalle();