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
var fire_enemy = []; //arreglo de fuego que lanza el enemigos
//enemigo final el cual necesita conocer sus valores maximos y minimos de spawneo
var enemy = {
    enemy_el: null, //aqui se guarda el objeto que obtiene la creacion del enemigo
    x: {
        x_max: (window.innerWidth - 150), //tam pantalla -150px
        x_min: (window.innerHeight * 3 / 4) //3/4 de pantalla
    },
    y: {
        y_max: (window.innerHeight - 150), // tam pantalla -150px
        y_min: 150
    },
    velocidad_mov: 1,
    new_cor: null,
    vida: 1700
};  //enemigo lo declaramos, pero mas tarde añadiremos en el create su imagen en el juego

var game = new Phaser.Game(config);

function preload() {
    // Here we're gonna preload all images
    this.load.image('nave', '../media/nave.png');
    this.load.image('fondo', '../media/fondo.webp');
    this.load.image('bala', './media/bullet.png');
    this.load.image('enemy', '../media/enemigo.png');
    this.load.image('fire', '../media/fire.png')
}

function create() {
    // We're gonna create all items 
    //imagen de fondo
    this.add.image(500, 500, 'fondo');

    //creamos al jugador y lo asignamos en una variable
    player = this.add.image(100, 450, 'nave');


    //crearemos el enemigo con coordenadas aleatorias esto llamando a una funcion la cual me retornara
    // dos numeros aleatorios en 'X' y 'Y'
    let X = Math.floor(Math.random() * (enemy.x.x_max - enemy.x.x_min) + enemy.x.x_min);
    let Y = Math.floor(Math.random() * (enemy.y.y_max - enemy.y.y_min) + enemy.y.y_min);
    //console.log(X + ' ' + Y);
    enemy.enemy_el = this.add.image(X, Y, 'enemy'); //creamos el enemigo en coordenadas aleatorias


    //creamos un evento que se repetira cada 500ms que creara una bala
    this.time.addEvent({
        delay: 500, // Cada 500ms 

        //crearemos una funcion anonima que se estara llamando cada 500ms para  simular un disparo
        callback:
            () => {
                //agregamos una bala en el arreglo cada 500ms y la agregamos a pantalla como un nuevo elemento
                balas.push(this.add.image(player.x, player.y, 'bala'));
                //console.log(balas);
            },
        callbackScope: this,
        loop: true // Se repite indefinidamente
    });

    //creamos un evento que se repetira cada 700ms, la cual creara nuevas coordenadas para nuestro enemigo
    // y a su vez creara un ataque, que sera una bola de fuego contra la nave
    this.time.addEvent({
        delay: 700 / (enemy.velocidad_mov), // Cada 700ms, despues ira aumentando para la velocidad de creacion

        //crearemos una funcion anonima que se estara llamando cada 2000ms para  simular un disparo
        callback:
            () => {
                //creamos nuevas posiciones random para que se mueva el enemigo cada 2s
                let X = Math.floor(Math.random() * (enemy.x.x_max - enemy.x.x_min) + enemy.x.x_min);
                let Y = Math.floor(Math.random() * (enemy.y.y_max - enemy.y.y_min) + enemy.y.y_min);

                enemy.new_cor = { x: X, y: Y };
                console.log(enemy.new_cor);

                //agregamos un nuevo elemento a el arreglo para despues recorrerlo
                fire_enemy.push(this.add.image(enemy.enemy_el.x, enemy.enemy_el.y, 'fire'));
            },
        callbackScope: this,
        loop: true // Se repite indefinidamente
    });


    //creamos la entrada de eventos desde el teclado
    cursors = this.input.keyboard.createCursorKeys();

    //agregamos el score y el numero de vidas
    scoreText = this.add.text(16, 16, 'Score: 0 Vidas: 0', { fontSize: '32px', fill: 'white' });
}


function update() {
    if (gameOver) return; //si perdio termina ejecucion

    //modificaremos la posicion de las balas, a su vez revisamos si se necesita eliminar
    // despues revisaremos aqui mismo si colisiono con el enemigo
    balas.forEach((bala, index) => {
        bala.x += 5; // Mueve la bala a la derecha

        //revisamos que haya colisiones y en caso de que si elimina la bala
        // de lo contrario revisa si no ha salido del recuadro
        if (checkCollision(bala, enemy.enemy_el)) {
            score += 10;
            scoreText.setText(`Score: ${score} Vidas: ${vidas}`);

            enemy.vida -= 2; //disminuye la vida del enemigo cada que tenga una colision
            enemy.velocidad_mov += .1; //aumenta velocidad de movimiento
            bala.destroy(); //se elimina la bala que impacto
            balas.splice(index, 1); //se elimina del arreglo la bala para que no pase por el foreach
        } else if (bala.x > window.innerWidth) { //Revisa si la bala sobrepaso el limite 
            bala.destroy(); // Elimina la bala del juego
            balas.splice(index, 1); //eliminamos la bala del arreglo
        }
    });

    fire_enemy.forEach((elem, index) => {
        elem.x -= 7; //mueve el disparo de el enemigo a la izquierda para dar al jugador

        //en caso de colision con el jugador le quitamos una vida y eliminamos 
        // lo que disparo el enemigo
        if (checkCollision(elem, player)) {
            vidas--; //quitamos una vida
            scoreText.setText(`Score: ${score} Vidas: ${vidas}`);
            elem.destroy(); //se elimina el elemento que impacto
            fire_enemy.splice(index, 1); //eliminamos el elemento de el arreglo

        } else if (elem.x < 0) { // Revisa si el elemento salio de la zona para eliminarlo
            elem.destroy(); //se elimina el elemento que impacto
            fire_enemy.splice(index, 1); //eliminamos el elemento de el arreglo

        }
    });

    //aqui vamos a mover al enemigo hasta su nueva posicion
    if (enemy.new_cor) { //si no esta vacio o no es null entrara
        //si alguna de las dos coordenadas aun no llega a su destino entrara para moverse
        if (enemy.new_cor.x !== enemy.enemy_el.x || enemy.new_cor.y !== enemy.enemy_el.y) {
            //esto por cada actualizacion movera a las nuevas coordenadas a el enemigo
            enemy.enemy_el.x += Math.sign(enemy.new_cor.x - enemy.enemy_el.x) * enemy.velocidad_mov;
            enemy.enemy_el.y += Math.sign(enemy.new_cor.y - enemy.enemy_el.y) * enemy.velocidad_mov;
        } else {
            enemy.new_cor = null; //en caso de que ya llegue a su destino se pone en null la variable enemy.new_cor
        }
    }


    //cada que se presione alguna tecla se movera en su eje x o y
    // no sobrepasara el espacion visible
    if (cursors.left.isDown && player.x > 0) {
        //console.log('left')
        player.x += -5;
    }
    //al momento de moverse a la izquierda limitaremos el movimiento hasta 1/4 de la pantalla
    if (cursors.right.isDown && player.x < (window.innerWidth / 4)) {
        //console.log('right')
        player.x += +5;
    }
    if (cursors.up.isDown && player.y > 0) {
        //console.log('up')
        player.y += -5;
    }
    if (cursors.down.isDown && player.y < (window.innerHeight)) {
        //console.log('down')
        player.y += +5;
    }

    //por ultimo revisamos que no haya perdido, cuando sea 0 esta detendra la ejecucion
    if(!vidas) gameOver = true;
}


//Funcion que checa la colision de dos elementos
function checkCollision(obj1, obj2) {
    let rect1 = obj1.getBounds();
    let rect2 = obj2.getBounds();

    // console.log("Rect1:", rect1);
    // console.log("Rect2:", rect2);

    return Phaser.Geom.Intersects.RectangleToRectangle(rect1, rect2);
}