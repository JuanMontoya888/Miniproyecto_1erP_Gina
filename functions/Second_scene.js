//creamos la configuracion de el videojuego que sera ingresada al inicio
// esta configuracion es almacenada en un JSON
var config =
{
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene:
    {
        preload: preload,
        create: create,
        update: update
    }
};

var vidas = 3;
var score = 0, gameOver = false, scoreText;
var player; //jugador que sera la nave
var balas = []; //arreglo de balas que estaran en constante disparo
//enemigo final el cual necesita conocer sus valores maximos y minimos de spawneo
var enemy = {
    enemy_el: null,
    x: {
        x_max: (window.innerWidth - 150), //tam pantalla -150px
        x_min: (window.innerHeight * 3 / 4) //3/4 de pantalla
    },
    y: {
        y_max: (window.innerHeight - 150), // tam pantalla -150px
        y_min: 150
    }
};  //enemigo lo declaramos, pero mas tarde añadiremos en el create su imagen en el juego

var game = new Phaser.Game(config);

function preload() {
    // Here we're gonna preload all images
    this.load.image('nave', '../media/nave.png');
    this.load.image('fondo', '../media/fondo.webp');
    this.load.image('bala', './media/bullet.png');
    this.load.image('enemy', '../media/enemigo.png');
}

function create() {
    // We're gonna create all items 
    //imagen de fondo
    this.add.image(500, 500, 'fondo');

    //creamos al jugador y lo asignamos en una variable
    player = this.add.image(100, 450, 'nave');

    //crearemos el enemigo con coordenadas aleatorias esto llamando a una funcion la cual me retornara
    // dos numeros aleatorios en 'X' y 'Y'
    let X = Math.floor(Math.random() * (enemy.x.x_max - enemy.x.x_min) + enemy.x.x_min );
    let Y = Math.floor(Math.random() * (enemy.y.y_max - enemy.y.y_min) + enemy.y.y_min);

    //console.log(X + ' ' + Y);
    enemy.enemy_el = this.add.image(X, Y, 'enemy');

    //creamos un evento que se repetira cada 1000ms que creara una bala
    this.time.addEvent({
        delay: 1000, // Cada 1000ms (1 segundo)
        callback: disparos, // LLama la funcion disparos
        callbackScope: this, 
        loop: true // Se repite indefinidamente
    });


    //creamos la entrada de eventos desde el teclado
    cursors = this.input.keyboard.createCursorKeys();

    //agregamos el score y el numero de vidas
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}


function update() {
    if (gameOver) return;

    //modificaremos la pocision de las balas, a su vez revisamos si se necesita eliminar
    // despues revisaremos aqui mismo si colisiono con el enemigo
    balas.forEach((bala, index) => {
        bala.x += 5; // Mueve la bala a la derecha

        if (bala.x > window.innerWidth) { //Revisa si 
            bala.destroy(); // Elimina la bala del juego
            balas.splice(index, 1); //eliminamos la bala del array
        }
    });


    //cada que se presione alguna tecla se movera en su eje x o y
    // no sobrepasara el espacion visible
    if (cursors.left.isDown && player.x > 0) {
        console.log('left')
        player.x += -5;
    }

    //al momento de moverse a la izquierda limitaremos el movimiento hasta 1/4 de la pantalla
    if (cursors.right.isDown && player.x < (window.innerWidth / 4)) {
        console.log('right')
        player.x += +5;
    }
    if (cursors.up.isDown && player.y > 0) {
        console.log('up')
        player.y += -5;
    }
    if (cursors.down.isDown && player.y < (window.innerHeight)) {
        console.log('down')
        player.y += +5;
    }
}


//crearemos una funcion que se estara llamando cada 700 ms para  simular un disparo
function disparos() {
    //agregamos una bala en el arreglo cada 700ms y la agregamos a pantalla como un nuevo elemento
    balas.push(this.add.image(player.x, player.y, 'bala'));
    //console.log(balas);
}
