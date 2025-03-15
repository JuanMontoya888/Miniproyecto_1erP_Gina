const letras = document.querySelectorAll('.letras');
const zonas = document.querySelectorAll('.dropzone');
let colocadas = 0;
let nombre = JSON.parse(localStorage.getItem('nombre')) || [];// el ||[] es para inicializar el array en caso de que no tenga nada
let nombre_completo = [];


letras.forEach(letra => {
    letra.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('id', letra.id);
    });
});

zonas.forEach(zona => {
    zona.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    zona.addEventListener('drop', (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('id');
        nombre_completo.push(id);
        console.log(nombre_completo);
        

        const letra_valor = document.getElementById(id);

        if (zona.children.length === 0) { // Verifica que la zona esté vacía
            const clon = letra_valor.cloneNode(true); // Clona la pieza
            clon.id = id ; // ID único
            clon.draggable = true;

            // Añadir evento de dragstart al clon
            clon.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('id', clon.id);
            });

            zona.appendChild(clon); // Agrega el clon a la zona
        }
    });
});

validar = () => {
    if (nombre_completo.length < 4 || nombre_completo.length > 8) {
        alert('Debes ingresar un nombre de 4 a 8 letras');

        // Limpiar todas las zonas
        zonas.forEach(zona => {
            zona.innerHTML = ""; // Borra todo el contenido de la zona
        });

        // Reiniciar el array correctamente
        nombre_completo = []; 

        return;
    } else {
        const new_name = nombre_completo.join('');
        nombre.push(new_name);
        localStorage.setItem('nombre', JSON.stringify(nombre));

        location.href = 'startGame.html';
    }
};