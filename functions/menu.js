document.addEventListener("keydown", function (event) {
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

// Obtenemos todos los botones
const buttons = document.getElementsByClassName('radio-wrapper');
let selected = -1;

// Función qeu simula el hover
function aplicarHover(button) {
    const texto = button.querySelector('.btn');

    texto.style.transition = 'all 0.3s ease';
    texto.style.fontSize = '1.2em';
    texto.style.color = 'black';
}

// Restaurar estilos
function restaurarEstilos(button) {
    // Accede al hijo que contiene el texto
    const texto = button.querySelector('.btn');

    texto.style.transition = '';
    texto.style.fontSize = '';
    texto.style.color = '';
}

window.addEventListener('keydown', (event) => {
    const buttons = document.querySelectorAll('.radio-wrapper');

    switch (event.key) {
        case 'ArrowLeft':
            selected = (selected < 1) ? buttons.length - 1 : selected -= 1;
            //validaremos para que el seleccionado se le ponga las propiedades de hover
            buttons.forEach((element, index) => { (index === selected) ? aplicarHover(element) : restaurarEstilos(element); });
            break;

        case 'ArrowRight':
            selected = (selected > buttons.length - 2) ? 0 : selected += 1;
            buttons.forEach((element, index) => { (index === selected) ? aplicarHover(element) : restaurarEstilos(element); });
            break;

        case 'Enter':
            if (selected > 0 && selected < 4) buttons[selected].click();
            break;

        case ' ':
            if (selected > 0 && selected < 4) buttons[selected].click();
            break;
    }
});

