function iniciar(){
    var imagenes = document.querySelectorAll('#abecedario > img');
    for(var i = 0; i < imagenes.length; i++){
        imagenes[i].addEventListener('dragstart', arrastrado, false);
        imagenes[i].addEventListener('dragend', finalizado, false);
        
    }

    soltar = document.getElementById('lienzo');
    lienzo = soltar.getContext('2d');
    soltar.addEventListener('dragenter', eventoEnter, false);
    soltar.addEventListener('dragover', eventoOver, false);
    soltar.addEventListener('drop', soltado, false);

}

function eventoEnter(e){
    e.preventDefault();
}

function eventoOver(e){
    e.preventDefault();
}

function finalizado(e){
    elemento = e.target;

}

function arrastrado(e){
    e.dataTransfer.setData('src', e.target.src);

}

function soltado(e) {
    e.preventDefault();
    var src = e.dataTransfer.getData('src');
    var img =  new Image();
    img.src = src;
    img.onload = function () {
        var posx = e.pageX - soltar.offsetLeft; // Coordenada X
        var posy = e.pageY - soltar.offsetTop;  // Coordenada Y
        lienzo.drawImage(img, posx, posy, 50, 50); // Dibuja la imagen en el canvas
    };
}

window.addEventListener('load', iniciar, false);



const letras = document.querySelectorAll('.letras');
const zonas = document.querySelectorAll('.dropzone');
let colocadas = 0;

letras.forEach(letra => {
    letra.addEventListener('dragstart', (e) => {
        //guarda el id de cada pieza
        e.dataTransfer.setData('id', letra.id);
    });
});

zonas.forEach(zona => {//agrega eventos a las zonas donde van a ir las piezas
    zona.addEventListener('dragover', (e) => {//añade en todas las zonas el evento de drag over para que las piezas se puedan soltar
        e.preventDefault();
    });

    zona.addEventListener('drop', (e) => {//añade un evento en todas las zonas para cuando las piezas son soltadas
        e.preventDefault();
        //obtiene el id de la pieza que fue soltada
        const id = e.dataTransfer.getData('id');
        const pieza = document.getElementById(id);//guarda la pieza por medio del id

        if (zona.children.length === 0 && id === zona.dataset.id) {//verifica que la zona no tenga una pieza ya y que la pieza que se solto sea la que
            //debe ir en esa zona
            zona.appendChild(pieza);//Agrega la pieza en la zona
            pieza.style.cursor = 'default';//agrega estilos del cursor para la pieza
            pieza.draggable = false;//hace que la pieza soltada ya no se pueda arrastrar
            colocadas++;//incrementa el contador de las piezas que ya han sido colocadas correctamente
        }

      
    });
});    