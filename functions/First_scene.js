var config = {
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

var bandLoop = true;
var vidas, numVidas = 3;
var player;
var stars = [];
var asteroids;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var name = "Juan Mauricio";

var game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', '../media/sky.png');
    this.load.image('ground', '../media/platform.png');
    this.load.image('star', '../media/star.png');
    this.load.image('asteroid', '../media/asteroid.png');
    this.load.spritesheet('dude', '../media/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('vida', '../media/vidas.png');
}

function create() {
    //  A simple background for our game
    this.add.image(400, 300, 'sky');
    this.add.image(1200, 300, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    platforms.create(400, window.innerHeight - 50, 'ground').setScale(2).refreshBody();
    platforms.create(1000, window.innerHeight - 50, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 450, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(1200, 350, 'ground');
    platforms.create(750, 220, 'ground');

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

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //creamos un evento que se repetira cada 1500ms que creara una estrella
    this.time.addEvent({
        delay: 1500,
        //crearemos una funcion anonima
        callback:
            () => {
                stars.push(this.physics.add.sprite(Phaser.Math.Between(50, window.innerHeight), 20, 'star'));
                this.physics.add.collider(stars ,platforms)
            },
        callbackScope: this,
        loop: bandLoop // Se repite indefinidamente
    });

    asteroids = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(asteroids, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    //las vidas del jugador
    vidas = [
        this.add.image(window.innerWidth - 40, 40, 'vida'),
        this.add.image(window.innerWidth - 100, 40, 'vida'),
        this.add.image(window.innerWidth - 160, 40, 'vida')
    ];


    //creamos un evento que se repetira cada 15s que creara un item especial, y pasado el tiempo lo eliminara, ese dara mas puntos
    this.time.addEvent({
        delay: 15000,
        //crearemos una funcion anonima
        callback:
            () => {
                //agregamos item especial
            },
        callbackScope: this,
        loop: bandLoop // Se repite indefinidamente
    });

    //creamos un evento que se repetira cada 10s que creara un asteroide
    this.time.addEvent({
        delay: 7000, callback: crearAsteroide, callbackScope: this, loop: bandLoop // Se repite indefinidamente
    });



    this.physics.add.collider(player, asteroids, hitAsteroid, null, this);
}

function update() {
    if (score === 100) saveData_LS();
    if (gameOver) saveScore_LS();

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
}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText(`Score: ${score}`);
}

function hitAsteroid(player, asteroid) {

    player.setTint(0xff0000);

    // vamos eliminando las imagenes de corazones cada que un asteroide golpee
    //y tambien las eliminamos del array
    vidas[vidas.length - 1].destroy();
    vidas.pop();

    //eliminamos el asteroide que nos exploto
    asteroid.destroy();

    numVidas--;
    scoreText.setText(`Score: ${score}`);

    if (numVidas == 0) {
        gameOver = true;
        bandLoop = false;
        player.anims.play('turn');
        this.physics.pause();
    }
}


function crearAsteroide() {
    var x = (player.x < 400) ? Phaser.Math.Between(400, window.innerWidth) : Phaser.Math.Between(0, 400);

    var asteroid = asteroids.create(x, 16, 'asteroid');
    asteroid.setBounce(1);
    asteroid.setCollideWorldBounds(true);
    asteroid.setVelocity(Phaser.Math.Between(-200, 200), 20);
    asteroid.allowGravity = false;
    //agregamos item especial

}


//Función que guarda los datos de esta escena
function saveData_LS(){
    //aqui creamos el registro con los datos de la escena
    var data_user = {
        name: name,
        score: score
    };

    localStorage.setItem('recent_data', JSON.stringify(data_user)); // enviamos al localStorage
}

function saveScore_LS(){
    var registerArray = JSON.parse(localStorage.getItem('scores')) || []; //obtenemos la lista de todos los registros
    var data_user = {
        name: name,
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