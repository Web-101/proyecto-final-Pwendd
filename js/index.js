async function cargarComponente(ruta, elementoId) {
    const contenedor = document.getElementById(elementoId);

    if (!contenedor) {
        return;
    }

    try {
        const respuesta = await fetch(ruta);

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar el componente: " + ruta
            );
        }

        contenedor.innerHTML = await respuesta.text();
    } catch (error) {
        console.error(error);

        contenedor.innerHTML =
            "<p>No se pudo cargar este componente.</p>";
    }
}

async function cargarComponentes() {
    await Promise.all([
        cargarComponente(
            "componentes/header.html",
            "header"
        ),
        cargarComponente(
            "componentes/footer.html",
            "footer"
        )
    ]);
}

async function cargarPeliculas() {
    const contenedor =
        document.getElementById("carteleras");

    if (!contenedor) {
        return;
    }

    try {
        const respuesta = await fetch("/api/cartelera");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar la cartelera."
            );
        }

        const peliculas = await respuesta.json();

        contenedor.innerHTML = "";

        peliculas.forEach(function (pelicula) {
            const tarjeta =
                document.createElement("article");

            tarjeta.className = "cartelera";

            tarjeta.style.backgroundImage =
                "url('" + pelicula.foto + "')";

            tarjeta.innerHTML = `
                <section class="cartelera-header">
                    <h3>EN CARTELERA</h3>
                </section>

                <section class="cartelera-contenido">
                    <div class="cartelera-info">
                        <h3 class="genero"></h3>
                        <h2 class="titulo"></h2>
                        <h4 class="audio"></h4>
                    </div>

                    <a class="button-centro">
                        RESERVAR ENTRADA
                    </a>
                </section>
            `;

            tarjeta.querySelector(".genero").textContent =
                pelicula.genero;

            tarjeta.querySelector(".titulo").innerHTML =
                pelicula.titulo;

            tarjeta.querySelector(".audio").textContent =
                pelicula.calificacion +
                " · " +
                pelicula.audio;

            tarjeta.querySelector(".button-centro").href =
                "detalle.html?id=" +
                encodeURIComponent(pelicula.id);

            contenedor.appendChild(tarjeta);
        });
    } catch (error) {
        console.error(error);

        contenedor.innerHTML = `
            <p class="mensaje-error">
                No se pudo cargar la cartelera.
                Verifica que el servidor esté funcionando.
            </p>
        `;
    }
}

cargarComponentes();
cargarPeliculas();