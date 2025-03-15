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
let asteroids, bala, balas = [];
let platforms, plataformas = [];
let cursors, score = 0;
let gameOver = false;
let scoreText;
const timeTake = 8000;
let temporizador, time = 90;
let timeText; //etiqueta del tiempo
let events_time = []; //se guardan todos los eventos de tiempo, para detenerlos
let win = false;
let name_user; //nombre del usuario
let lastFired = 0; // Variable para controlar el tiempo de disparo, cada 300ms


let game = new Phaser.Game(config);

function preload() {
    const div = document.createElement('div');
    div.style.fontFamily = 'RetroFont';
    div.style.position = 'absolute';
    div.style.opacity = '0';
    div.innerHTML = '.';
    document.body.appendChild(div);
    
    this.load.image('fondo', '../media/fondo.jpg');
    this.load.image('platform', '../media/platform.png');
    this.load.image('suelo', '../media/suelo.png');
    this.load.image('star', '../media/star.png');
    this.load.image('enemy', '../media/enemigo.png');
    this.load.spritesheet('dude', '../media/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('vida', '../media/vidas.png');
    this.load.image('disparo', '../media/bullet.png');
    this.load.image('disparo_R', '../media/bullet_R.png');
}

function create() {
    //obtenemos el nombre guardado en el localStorage
    users_array = JSON.parse(localStorage.getItem('nombre'));
    name_user = users_array[users_array.length - 1];

    // fondo de nuestro juego
    this.add.image(680, 300, 'fondo');

    //plataformas que se iran moviendo, quitamos gravedad y que no afecte la colision de un objeto
    platforms = this.physics.add.group({
        allowGravity: false, // No afecta la gravedad
        immovable: true // No se mueven al colisionar
    });
    //Creamos el suelo sobre el que rebotaran las cosas
    suelo = this.physics.add.staticGroup();

    //suelo
    suelo.create(200, window.innerHeight - 40, 'suelo').setScale(.8).refreshBody();
    suelo.create(600, window.innerHeight - 10, 'suelo').setScale(.6).refreshBody();
    suelo.create(1200, window.innerHeight - 40, 'suelo').setScale(.8).refreshBody();

    //creamos 2 plataformas inicialmente
    for(let i = 0 ; i < 4 ; i++){
        plataformas.push(platforms.create( 
            Phaser.Math.Between(300 + (i*100), window.innerWidth-200 + (i*100)) , //el i para hacer que no spawneen iguales
            Phaser.Math.Between(300, window.innerHeight-200) , 
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
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
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
                this.physics.add.collider(stars ,platforms)
                this.physics.add.collider(stars ,suelo)
            },
        callbackScope: this,
        loop: true // Se repite indefinidamente
    });

    asteroids = this.physics.add.group();
    bala = this.physics.add.group({ //balas que va a disparar el mono
        allowGravity: false, // No afecta la gravedad
    });

    // colisiones de los elementos
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(asteroids, platforms);
    this.physics.add.collider(player, suelo);
    this.physics.add.collider(asteroids, suelo);

    // Revisar si no se sobreponen elementos, le mandas una funcion y ejecutara cuando se sobrepongan
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.overlap(bala, asteroids, destroy_asteroid, null, this);
    this.physics.add.overlap(bala, platforms, (bala, platform)=>{bala.disableBody(true, true)}, null, this);    


    //las vidas del jugador
    vidas = [
        this.add.image(window.innerWidth - 40, 40, 'vida'),
        this.add.image(window.innerWidth - 100, 40, 'vida'),
        this.add.image(window.innerWidth - 160, 40, 'vida')
    ];

    //creamos un evento que se repetira cada 15s a 20s que creara un item especial, y pasado el tiempo lo eliminara, ese dara mas puntos
    events_time[1] = this.time.addEvent({
        delay:  Phaser.Math.Between(15000, 20000),
        //crearemos una funcion anonima
        callback:
            () => {

            },
        callbackScope: this,
        loop: true // Se repite indefinidamente
    });

    //creamos un evento que se repetira cada 10s que creara un enemigo
    events_time[2] =this.time.addEvent({
        delay: 8000, callback: crearAsteroide, callbackScope: this, loop: true // Se repite indefinidamente
    });

    //creamos un evento que se llamara cada segundo, el cual va a detener ejecucion cuando termine
    temporizador = this.time.addEvent({
        delay: 1000, callback: clock, callbackScope: this, loop: true
    });


    //colision de el asteroide con el jugador
    this.physics.add.collider(player, asteroids, hitAsteroid, null, this);
    

    scoreText = this.add.text(16, 46, '', {fontSize: '18px',  fill: 'white',  fontFamily: 'RetroFont'  });
    scoreText.setText(`Score: ${score}`);
    timeText = this.add.text(256, 46, ``, { fontSize: '18px', fill: 'white',  fontFamily: 'RetroFont' });
    timeText.setText(`Time: ${time} seg`);

}

function update() {
    if (win) {
        saveData_LS();
        location.href = 'secondScene.html';
    };
    if (gameOver){
        saveScore_LS();
    };

    //funcion que movera las plataformas a la izquierda
    plataformas.forEach((platform, index) => {
        platform.setVelocityX(-80);

        //cuando esta desaparezca creara una nueva plataforma
        if(platform.x < -200){
            platform.destroy(); //eliminamos la plataforma
            plataformas.splice(index, 1); //la eliminamos del arreglo
            plataformas.push(platforms.create( //Crearemos una nueva plataforma 
                Phaser.Math.Between((window.innerWidth/2) + 200, window.innerWidth-50) , 
                Phaser.Math.Between(100, window.innerHeight-300) , 
                'platform').setScale(Phaser.Math.Between(.7, 1))
            );
        }
    });

    //desplazaremos los disparos que de el mono
    balas.forEach((element, index)=>{
        //aqui revisamos hacia que lado esta volteando y hacia alla dispararemos
        if(element.left){ //si esta hacia el lado izquierdo se ira a los negativo
            element.bala.setVelocityX(-700);
        }else{ //si no, por default ira a los positivos
            element.bala.setVelocityX(700);
        }

        if(element.bala.x > window.innerWidth || element.bala.x < 0){ //si sobrepasa la pantalla en ambas direcciones eliminamos la bala
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


    // Dentro del update
    if (cursors.space.isDown && this.time.now > lastFired) {
        disp = {
            left: (cursors.left.isDown) ? true : false,
            bala: bala.create(player.x, player.y, (cursors.left.isDown) ? 'disparo_R' : 'disparo' )
        };
        balas.push(disp);
        lastFired = this.time.now + 300; // Disparar cada 300ms
    }
    
}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText(`Score: ${score}`);
}

//cuando se sobrepongan la bala y el asteroide este se destruira
function destroy_asteroid(bala, asteroide){
    bala.disableBody(true, true);
    asteroide.disableBody(true, true);

    score += 25;
    scoreText.setText(`Score: ${score}`);
}

function hitAsteroid(player, enemy) {
    // vamos eliminando las imagenes de corazones cada que un asteroide golpee
    //y tambien las eliminamos del array
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

function crearAsteroide() {
    let x = (player.x < 400) ? Phaser.Math.Between(400, window.innerWidth) : Phaser.Math.Between(0, 400);

    let enemy = asteroids.create(x, 16, 'enemy').setScale(.2);
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
    enemy.setVelocity(Phaser.Math.Between(-200, 200), 20);
    enemy.allowGravity = false;
    //agregamos item especial

}

//funcion que actualizara el reloj, cuando llegue a 0 este detendra el reloj y la ejecucion
function clock(){
    time--;
    timeText.setText(`Time: ${time} seg`);
    if(!time){
        temporizador.remove();
        events_time.forEach((element)=>{element.remove()});
        win = true;
    }
}


//Función que guarda los datos de esta escena
function saveData_LS(){
    //aqui creamos el registro con los datos de la escena
    let data_user = {
        name: name_user,
        score: score
    };

    localStorage.setItem('recent_data', JSON.stringify(data_user)); // enviamos al localStorage
}

function saveScore_LS(){
    let registerArray = JSON.parse(localStorage.getItem('scores')) || []; //obtenemos la lista de todos los registros
    let data_user = {
        name: name_user,
        score: score
    };

    
    //si encuentra el registro con el mismo nombre y si es mayor el score lo eliminara, sino solo lo actualizara
    if(registerArray.find((element) => element.name === data_user.name)){
        registerArray.forEach((element, index) => {
            if(element.name === data_user.name) {
                if(element.score > data_user.score) data_user = registerArray.splice(index, 1) //eliminamos el registro
                else registerArray.splice(index, 1)
            }
        });
    }
    
    registerArray.push(data_user); //guardamos el registro en el array
    localStorage.setItem('scores', JSON.stringify(registerArray));
}