async function cargar() {

    const respuestaHeader = await fetch("componentes/header.html");
    const header = await respuestaHeader.text();
    document.getElementById("header").innerHTML = header;

    const respuestaFooter = await fetch("componentes/footer.html");
    const footer = await respuestaFooter.text();
    document.getElementById("footer").innerHTML = footer;

}
cargar();