let config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let vidas, numVidas = 3, player, stars = [];
let enemies, item_esp, bala, balas = [];
let platforms, plataformas = [];
let cursors, score = 0;
let gameOver = false;
let scoreText;
const timeTake = 8000;
let time_object;
let temporizador, time = 90;
let timeText, timeItem; //etiqueta del tiempo
let events_time = []; //se guardan todos los eventos de tiempo, para detenerlos
let win = false;
let name_user; //nombre del usuario
let lastFired = 0; // Variable para controlar el tiempo de disparo, cada 300ms
let music, damage, disparo;

let game = new Phaser.Game(config);

function preload() {
    const div = document.createElement('div');
    div.style.fontFamily = 'RetroFont';
    div.style.position = 'absolute';
    div.style.opacity = '0';
    div.innerHTML = '.';
    document.body.appendChild(div);

    //itemEsp
    this.load.image('itemEsp', '../media/itemEsp.png');

    this.load.audio('musicaFondo', '../media/sound/diverSoundtrack.mp3');
    this.load.audio('damage', '../media/sound/damage.mp3');
    this.load.audio('disparo', '../media/sound/disparo.mp3');


    this.load.image('fondo', '../media/fondo.jpg');
    this.load.image('platform', '../media/platform.png');
    this.load.image('suelo', '../media/suelo.png');
    this.load.image('star', '../media/star.png');
    this.load.image('star', '../media/item.png');
    this.load.image('enemy', '../media/enemigo.png');
    this.load.spritesheet('dude', `../media/${JSON.parse(localStorage.getItem('personaje_selected'))}`, { frameWidth: 48, frameHeight: 64 });
    this.load.image('vida', '../media/vidas.png');
    this.load.image('disparo', '../media/bullet.png');
    this.load.image('disparo_R', '../media/bullet_R.png');

    this.load.image('play', '../media/play.png');
}

function create() {

    music = this.musica = this.sound.add('musicaFondo');
    music.play({
        loop: true, // Repetir la música
        volume: 0.8
    });
    disparo = this.musica = this.sound.add('disparo');
    damage = this.musica = this.sound.add('damage');

    //obtenemos el nombre guardado en el localStorage
    users_array = JSON.parse(localStorage.getItem('nombre'));
    name_user = users_array[users_array.length - 1];

    // fondo de nuestro juego
    this.add.image(680, 300, 'fondo');
    this.add.image(window.innerWidth-350, 70, 'play').setScale(.8).setInteractive().on('pointerdown', ()=>{(music.isPlaying) ? music.pause() : music.resume()});
    this.add.text(window.innerWidth-410, 30, `Play/Resume`, { fontSize: '10px', fill: 'white', fontFamily: 'RetroFont' });

    //plataformas que se iran moviendo, quitamos gravedad y que no afecte la colision de un objeto
    platforms = this.physics.add.group({
        allowGravity: false, // No afecta la gravedad
        immovable: true // No se mueven al colisionar
    });
    //Creamos el suelo sobre el que rebotaran las cosas
    suelo = this.physics.add.staticGroup();
    item_esp = this.physics.add.group(); //item especial

    //suelo
    suelo.create(200, window.innerHeight - 40, 'suelo').setScale(.8).refreshBody();
    suelo.create(600, window.innerHeight - 10, 'suelo').setScale(.6).refreshBody();
    suelo.create(850, window.innerHeight - 10, 'suelo').setScale(.6).refreshBody();
    suelo.create(1200, window.innerHeight - 40, 'suelo').setScale(.8).refreshBody();

    //creamos 4 plataformas inicialmente
    for (let i = 0; i < 4; i++) {
        plataformas.push(platforms.create(
            Phaser.Math.Between(300 + (i * 100), window.innerWidth - 200 + (i * 100)), //el i para hacer que no spawneen iguales
            Phaser.Math.Between(200, window.innerHeight - 150),
            'platform').setScale(.8)
        );
    }

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 9, end: 11 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 3, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    // Entrada de eventos desde teclado
    cursors = this.input.keyboard.createCursorKeys();

    //creamos un evento que se repetira cada 3000ms que creara una estrella
    events_time[0] = this.time.addEvent({
        delay: 3000,
        //crearemos una funcion anonima
        callback:
            () => {
                stars.push(this.physics.add.sprite(Phaser.Math.Between(50, window.innerHeight), 10, 'star'));
                this.physics.add.collider(stars, platforms);
                this.physics.add.collider(stars, suelo);
            },
        callbackScope: this,
        loop: true // Se repite indefinidamente
    });

    enemies = this.physics.add.group();
    bala = this.physics.add.group({ //balas que va a disparar el mono
        allowGravity: false, // No afecta la gravedad
    });

    // colisiones de los elementos
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(player, suelo);
    this.physics.add.collider(enemies, suelo);

    // Revisar si no se sobreponen elementos, le mandas una funcion y ejecutara cuando se sobrepongan
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.overlap(bala, enemies, destroy_asteroid, null, this);
    this.physics.add.overlap(bala, platforms, (bala, platform) => { bala.disableBody(true, true) }, null, this);


    //las vidas del jugador
    vidas = [
        this.add.image(window.innerWidth - 100, 50, 'vida'),
        this.add.image(window.innerWidth - 160, 50, 'vida'),
        this.add.image(window.innerWidth - 220, 50, 'vida')
    ];

    //creamos un evento que se repetira cada 15s a 20s que creara un item especial, y pasado el tiempo lo eliminara, ese dara mas puntos
    events_time[1] = this.time.addEvent({
        delay: Phaser.Math.Between(15000, 20000), // Tiempo aleatorio entre 15s y 20s
        callback: crearItemEsp,
        callbackScope: this,
        loop: true // Repetir indefinidamente
    });


    //creamos un evento que se repetira cada 10s que creara un enemigo
    events_time[2] = this.time.addEvent({
        delay: 8000, callback: crearAsteroide, callbackScope: this, loop: true // Se repite indefinidamente
    });

    //creamos un evento que se llamara cada segundo, el cual va a detener ejecucion cuando termine
    temporizador = this.time.addEvent({
        delay: 1000, callback: clock, callbackScope: this, loop: true
    });


    //colision de el asteroide con el jugador
    this.physics.add.collider(player, enemies, hitEnemy, null, this);


    const fechaActual = new Date();
    const Fecha = fechaActual.toLocaleDateString();

    this.add.text(16, 36, `Name: ${name_user}`, { fontSize: '18px', fill: 'white', fontFamily: 'RetroFont' });
    this.add.text(336, 36, `Date: ${Fecha}`, { fontSize: '18px', fill: 'white', fontFamily: 'RetroFont' });
    scoreText = this.add.text(16, 86, `Score: ${score}`, { fontSize: '18px', fill: 'white', fontFamily: 'RetroFont' });
    timeText = this.add.text(336, 86, `Time: ${time}s`, { fontSize: '18px', fill: 'white', fontFamily: 'RetroFont' });
    timeItem = this.add.text(window.innerWidth - 500, 46, ``, { fontSize: '18px', fill: 'red', fontFamily: 'RetroFont' });

}

function update() {
    if (win) {
        saveData_LS();
        events_time.forEach((element)=>{element.remove()});
        this.time.addEvent({delay: 3000, callback: ()=>{}, callbackScope: this, loop: true});

        
        location.href = 'textRetro.html';
        obj = { value: 'Loading ...', page: 'secondScene.html' };
        localStorage.setItem('text', JSON.stringify(obj));
    };
    if (gameOver) {
        saveScore_LS();
        events_time.forEach((element)=>{element.remove()});
        this.time.addEvent({delay: 3000, callback: ()=>{}, callbackScope: this, loop: true});

        
        location.href = 'textRetro.html';
        obj = { value: 'Game Over', page: 'menu.html' };
        localStorage.setItem('text', JSON.stringify(obj));
    };

    //funcion que movera las plataformas a la izquierda
    plataformas.forEach((platform, index) => {
        platform.setVelocityX(-80);

        //cuando esta desaparezca creara una nueva plataforma
        if (platform.x < -200) {
            platform.destroy(); //eliminamos la plataforma
            plataformas.splice(index, 1); //la eliminamos del arreglo
            plataformas.push(platforms.create( //Crearemos una nueva plataforma 
                Phaser.Math.Between((window.innerWidth / 2) + 300, window.innerWidth),
                Phaser.Math.Between(100, window.innerHeight - 350),
                'platform').setScale(Phaser.Math.Between(.7, 1))
            );
        }
    });

    //desplazaremos los disparos que de el mono
    balas.forEach((element, index) => {
        //aqui revisamos hacia que lado esta volteando y hacia alla dispararemos
        if (element.left) { //si esta hacia el lado izquierdo se ira a los negativo
            element.bala.setVelocityX(-700);
        } else { //si no, por default ira a los positivos
            element.bala.setVelocityX(700);
        }

        if (element.bala.x > window.innerWidth || element.bala.x < 0) { //si sobrepasa la pantalla en ambas direcciones eliminamos la bala
            element.bala.destroy();
            balas.splice(index, 1);
        }
    });


    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    // disparo de balas
    if (cursors.space.isDown && this.time.now > lastFired) {
        disp = {
            left: (cursors.left.isDown) ? true : false,
            bala: bala.create(player.x, player.y, (cursors.left.isDown) ? 'disparo_R' : 'disparo')
        };
        balas.push(disp);
        lastFired = this.time.now + 300; // Disparar cada 300ms
        disparo.play({loop: false, volume: 0.8});
    }

}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText(`Score: ${score}`);
}

function collectItem(player, item) {
    item.disableBody(true, true);

    score += 40;
    scoreText.setText(`Score: ${score}`);
}

//cuando se sobrepongan la bala y el asteroide este se destruira
function destroy_asteroid(bala, asteroide) {
    bala.disableBody(true, true);
    asteroide.disableBody(true, true);

    score += 25;
    scoreText.setText(`Score: ${score}`);
}

function hitEnemy(player, enemy) {
    // vamos eliminando las imagenes de corazones cada que un asteroide golpee
    //y tambien las eliminamos del array
    damage.play({loop: false, volume: 0.8});

    vidas[vidas.length - 1].destroy();
    vidas.pop();

    //eliminamos el asteroide que nos exploto
    enemy.destroy();

    numVidas--;
    scoreText.setText(`Score: ${score}`);

    if (numVidas == 0) {
        gameOver = true;
        player.anims.play('turn');
        this.physics.pause();
    }
}

function crearItemEsp() {
    // Creamos el ítem especial con las mismas propiedades que el asteroide, pero este se podra tomar
    let x = (player.x < 400) ? Phaser.Math.Between(400, window.innerWidth) : Phaser.Math.Between(0, 400);
    let item = item_esp.create(x, 16, 'itemEsp').setScale(.05);
    item.setBounce(1);
    item.setCollideWorldBounds(true);
    item.setVelocity(Phaser.Math.Between(-200, 200), 20);
    item.allowGravity = true;

    this.physics.add.collider(item_esp, platforms);
    this.physics.add.collider(item_esp, suelo);
    this.physics.add.overlap(player, item_esp, collectItem, null, this);

    // Contador para los segundos restantes
    let timeLeft = 12;  // TIempo que se comparara
    timeItem.setText(`${timeLeft}s`);  // Mostrar el tiempo inicial

    // Timer dentro de otro timer, esto para eliminar el elemento cada cierto tiempo
    let countdown = this.time.addEvent({
        delay: 1000,   // Cada segundo
        callback: () => {
            timeLeft--;  // Restamos un segundo
            timeItem.setText(`${timeLeft}s`);  // Actualizar texto
            //Si ya tomaron el item esp desactivara el contador
            if (!item.active) {
                countdown.remove(); // Detener el contador
                timeItem.setText('');  // Limpiar el texto
            }

            // Cuando el tiempo se acabe, eliminar el ítem
            if (timeLeft <= 0) {
                item.disableBody(true, true);  // Desactivar el ítem
                countdown.remove();  // Detener el contador
                timeItem.setText('');  // Limpiar el texto
            }
        },
        callbackScope: this,
        loop: true
    });
}

function crearAsteroide() {
    let x = (player.x < 400) ? Phaser.Math.Between(400, window.innerWidth) : Phaser.Math.Between(0, 400);

    let enemy = enemies.create(x, 16, 'enemy').setScale(.2);
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
    enemy.setVelocity(Phaser.Math.Between(-200, 200), 20);
    enemy.allowGravity = false;
    //agregamos item especial

}

//funcion que actualizara el reloj, cuando llegue a 0 este detendra el reloj y la ejecucion
function clock() {
    time--;
    timeText.setText(`Time: ${time}s`);
    if (!time) {
        temporizador.remove();
        events_time.forEach((element) => { element.remove() });
        win = true;
    }
}


//Función que guarda los datos de esta escena
function saveData_LS() {
    //aqui creamos el registro con los datos de la escena
    let data_user = {
        name: name_user,
        score: score
    };

    localStorage.setItem('recent_data', JSON.stringify(data_user)); // enviamos al localStorage
}


function saveScore_LS() {
    let registerArray = JSON.parse(localStorage.getItem('scores')) || []; //obtenemos la lista de todos los registros
    const fechaActual = new Date();
    const Fecha = fechaActual.toLocaleDateString(); // Devuelve la fecha en formato local

    let data_user = {
        name: name_user,
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

    registerArray.push(data_user); //guardamos el registro en el array
    localStorage.setItem('scores', JSON.stringify(registerArray));
}