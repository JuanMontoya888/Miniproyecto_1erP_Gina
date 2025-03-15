document.addEventListener("keydown", function(event) {
    menu();
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function menu() {
    // No necesitamos verificar un elemento "menu" que no existe
    document.getElementById("pantalla_inicio").style.display = "none";
    document.getElementById("loader").style.display = "block";
    await sleep(3000); // Esperar 3 segundos
    document.getElementById("loader").style.display = "none";
    window.location.href = "menu.html"; // Redirigir a menu.html
}

