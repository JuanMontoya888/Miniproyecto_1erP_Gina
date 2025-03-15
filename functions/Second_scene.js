//creamos la configuracion de el videojuego que sera ingresada al inicio
// esta configuracion es almacenada en un JSON
let config =
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

let vidas = [];
let numVidas = 3;
let score = 0, gameOver = false, win = false, scoreText, choque, name_user, vida_enText;
let player; //jugador que sera la nave
let balas = []; //arreglo de balas que estaran en constante disparo
let fire_enemy = []; //arreglo de fuego que lanza el enemigos
//enemigo final el cual necesita conocer sus valores maximos y minimos de spawneo
let enemy = {
    enemy_el: null, //aqui se guarda el objeto que obtiene la creacion del enemigo
    x: {
        x_max: (window.innerWidth - 80), //tam pantalla -150px
        x_min: (window.innerHeight * 3 / 4) //3/4 de pantalla
    },
    y: {
        y_max: (window.innerHeight - 80), // tam pantalla -150px
        y_min: 80
    },
    velocidad_mov: 1,
    new_cor: null,
    vida: 100,
    vida_enemy: 100 //life constant
};  //enemigo lo declaramos, pero mas tarde añadiremos en el create su imagen en el juego
let events_time = []; //se guardan todos los eventos de tiempo, para detenerlos


let game = new Phaser.Game(config);

function preload() {
    const div = document.createElement('div');
    div.style.fontFamily = 'RetroFont';
    div.style.position = 'absolute';
    div.style.opacity = '0';
    div.innerHTML = '.';
    document.body.appendChild(div);

    // Here we're gonna preload all images
    this.load.image('nave', '../media/nave.png');
    this.load.image('fondo', '../media/fondo.jpg');
    this.load.image('bala', './media/bullet.png');
    this.load.image('enemy', '../media/enemigo2.png');
    this.load.image('fire', '../media/fire.png');
    this.load.image('vida', '../media/vidas.png');
    this.load.image('choque', '../media/choque.png');

}

function create() {
    score = JSON.parse(localStorage.getItem('recent_data')).score;
    name_user = JSON.parse(localStorage.getItem('recent_data')).name;
    // We're gonna create all items 
    //imagen de fondo
    this.add.image(680, 300, 'fondo');

    //creamos al jugador y lo asignamos en una variable
    player = this.add.image(100, 450, 'nave');


    //crearemos el enemigo con coordenadas aleatorias esto llamando a una funcion la cual me retornara
    // dos numeros aleatorios en 'X' y 'Y'
    let X = Phaser.Math.Between(enemy.x.x_min, enemy.x.x_max);
    let Y = Phaser.Math.Between(enemy.y.y_min, enemy.y.y_max);
    //console.log(X + ' ' + Y);
    enemy.enemy_el = this.add.image(X, Y, 'enemy').setScale(.8); //creamos el enemigo en coordenadas aleatorias
    enemy.enemy_el.setFlipX(true); // Aplica el efecto de espejo horizontal

    //creamos un evento que se repetira cada 500ms que creara una bala
    events_time[0] = this.time.addEvent({
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
    events_time[1] = this.time.addEvent({
        delay: 700 / (enemy.velocidad_mov), // Cada 700ms, despues ira aumentando para la velocidad de creacion
        //crearemos una funcion anonima que se estara llamando cada 2000ms para  simular un disparo
        callback:
            () => {
                //creamos nuevas posiciones random para que se mueva el enemigo cada 2s
                let X = Phaser.Math.Between(enemy.x.x_min, enemy.x.x_max);
                let Y = Phaser.Math.Between(enemy.y.y_min, enemy.y.y_max);

                enemy.new_cor = { x: X, y: Y };
                //console.log(enemy.new_cor);

                //agregamos un nuevo elemento a el arreglo para despues recorrerlo
                fire_enemy.push(this.add.image(enemy.enemy_el.x, enemy.enemy_el.y, 'fire'));
            },
        callbackScope: this,
        loop: true // Se repite indefinidamente
    });


    //creamos la entrada de eventos desde el teclado
    cursors = this.input.keyboard.createCursorKeys();

    //vidas de usuario
    vidas = [
        this.add.image(window.innerWidth - 40, 40, 'vida'),
        this.add.image(window.innerWidth - 100, 40, 'vida'),
        this.add.image(window.innerWidth - 160, 40, 'vida')
    ];


    const fechaActual = new Date();
    const Fecha = fechaActual.toLocaleDateString();


    //agregamos el score y el numero de vidas
    this.add.text(16, 36, `Name: ${name_user}`, { fontSize: '18px', fill: 'white', fontFamily: 'RetroFont' });
    this.add.text(336, 36, `Date: ${Fecha}`, { fontSize: '18px', fill: 'white', fontFamily: 'RetroFont' });
    scoreText = this.add.text(16, 86, `Score: ${score}`, { fontSize: '18px', fill: 'white', fontFamily: 'RetroFont' });
    vida_enText = this.add.text(336, 86, `Enemy's life: ${enemy.vida}`, { fontSize: '18px', fill: 'white', fontFamily: 'RetroFont' });

}


function update() {
    if (gameOver) {
        saveData_LS()
        events_time.forEach((elem) => {
            elem.remove();
        });

        location.href = 'textRetro.html';
        obj = { value: 'Game Over', page: 'menu.html' };
        localStorage.setItem('text', JSON.stringify(obj));
    }; //si perdio termina ejecucion
    if (win) {
        saveData_LS()
        events_time.forEach((elem) => {
            elem.remove();
        });

        location.href = 'textRetro.html';
        obj = { value: 'Win', page: 'menu.html' };
        localStorage.setItem('text', JSON.stringify(obj));
    };
    if (choque) choque.destroy();

    //modificaremos la posicion de las balas, a su vez revisamos si se necesita eliminar
    // despues revisaremos aqui mismo si colisiono con el enemigo
    balas.forEach((bala, index) => {
        bala.x += 5; // Mueve la bala a la derecha

        //revisamos que haya colisiones y en caso de que si elimina la bala
        // de lo contrario revisa si no ha salido del recuadro
        if (checkCollision(bala, enemy.enemy_el)) {
            score += 10;
            scoreText.setText(`Score: ${score}`);

            enemy.vida -= 2; //disminuye la vida del enemigo cada que tenga una colision
            enemy.velocidad_mov += .1; //aumenta velocidad de movimiento
            bala.destroy(); //se elimina la bala que impacto
            balas.splice(index, 1); //se elimina del arreglo la bala para que no pase por el foreach

            vida_enText.setText(`Enemy's life: ${enemy.vida}`);
            //simula el choque de la bala con el enemigo
            choque = this.add.image(enemy.enemy_el.x, enemy.enemy_el.y, 'choque');

        } else if (bala.x > window.innerWidth) { //Revisa si la bala sobrepaso el limite 
            bala.destroy(); // Elimina la bala del juego
            balas.splice(index, 1); //eliminamos la bala del arreglo
        }
    });

    //modificaremos la posicion de el disparo del enemigo, a su vez revisamos si se necesita eliminar
    // despues revisaremos aqui mismo si colisiono con el enemigo
    fire_enemy.forEach((elem, index) => {
        elem.x -= 7; //mueve el disparo de el enemigo a la izquierda para dar al jugador

        //en caso de colision con el jugador le quitamos una vida y eliminamos 
        // lo que disparo el enemigo
        if (checkCollision(elem, player)) {
            numVidas--;
            vidas[vidas.length - 1].destroy();
            vidas.pop(); //quitamos una vida
            scoreText.setText(`Score: ${score}`);
            elem.destroy(); //se elimina el elemento que impacto
            fire_enemy.splice(index, 1); //eliminamos el elemento de el arreglo
        } else if (elem.x < 0) { // Revisa si el elemento salio de la zona para eliminarlo
            elem.destroy(); //se elimina el elemento que impacto
            fire_enemy.splice(index, 1); //eliminamos el elemento de el arreglo

        }
    });

    //aqui vamos a mover al enemigo hasta su nueva posicion
    if (enemy.new_cor) { //si no esta vacio o no es null el objeto entrara
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
    if (numVidas === 0) gameOver = true;
    //revisar si gano
    if (enemy.vida === 0) win = true;
}


//Funcion que checa la colision de dos elementos
function checkCollision(obj1, obj2) {
    let rect1 = obj1.getBounds();
    let rect2 = obj2.getBounds();

    // console.log("Rect1:", rect1);
    // console.log("Rect2:", rect2);

    return Phaser.Geom.Intersects.RectangleToRectangle(rect1, rect2);
}

//Función que recupera los datos enviados de la escena pasada y las suma a las estadisticas de esta escena
// y los guarda en la tabla de registros de los que jugaron
function saveData_LS() {
    let recent_data = JSON.parse(localStorage.getItem('recent_data')); //obtenemos el JSON y lo convertimos a objeto
    //localStorage.setItem('recent_data', ''); //vaciamos el campo en el localStorage que fue usado en la primera escena
    let registerArray = JSON.parse(localStorage.getItem('scores')) || []; //obtenemos la lista de todos los registros

    const fechaActual = new Date();
    const Fecha = fechaActual.toLocaleDateString(); // Devuelve la fecha en formato local


    //aqui creamos el registro con los datos de la escena anterior y esta escena, el score y el nombre
    let data_user = {
        name: recent_data.name,
        score: score,
        fecha: Fecha 
    };

    //si encuentra el registro con el mismo nombre y si es mayor el score lo eliminara, sino solo lo actualizara
    if (registerArray.find((element) => element.name === data_user.name)) {
        registerArray.forEach((element, index) => {
            if (element.name === data_user.name) {
                if (element.score > data_user.score) data_user = registerArray.splice(index, 1) //eliminamos el registro
                else registerArray.splice(index, 1)
            }
        });
    }



    registerArray.push(data_user); //guardamos en los registros el nuevo registro hasta el inicio
    localStorage.setItem('scores', JSON.stringify(registerArray)); //volvemos a guardar en el localStorage
}