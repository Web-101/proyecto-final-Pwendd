function cargarComponentes() {

    fetch("componentes/header.html")
        .then(function (respuesta) {
            return respuesta.text();
        })
        .then(function (contenidoHeader) {
            document.getElementById("header").innerHTML =
                contenidoHeader;
        });


    fetch("componentes/footer.html")
        .then(function (respuesta) {
            return respuesta.text();
        })
        .then(function (contenidoFooter) {
            document.getElementById("footer").innerHTML =
                contenidoFooter;
        });
}


async function cargarPeliculas() {

    const respuesta =
        await fetch("/api/cartelera");

    const peliculas =
        await respuesta.json();

    const tarjetas =
        document.querySelectorAll(".cartelera");


    tarjetas.forEach(function (tarjeta, posicion) {

        const pelicula =
            peliculas[posicion];

        tarjeta.style.backgroundImage =
            "url('" + pelicula.foto + "')";

        tarjeta.querySelector(".genero").textContent =
            pelicula.genero;

        tarjeta.querySelector(".titulo").textContent =
            pelicula.nombre;

        tarjeta.querySelector(".audio").textContent =
            pelicula.calificacion +
            " · " +
            pelicula.audio;

        tarjeta.querySelector(".button-centro").href =
            "detalle.html?id=" +
            pelicula.id;
    });
}


cargarComponentes();

cargarPeliculas();