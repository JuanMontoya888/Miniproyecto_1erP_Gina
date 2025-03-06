//creamos la configuracion de el videojuego que sera ingresada al inicio
// esta configuracion es almacenada en un JSON
var config = 
{
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: 
    {
        gravity: {y:300},
        debug: false
    },
    scene: 
    {
        preload: preload,
        create: create,
        update: update
    }
};

var vidas = 3;
var player, score = 0, gameOver = false, scoreText;

var game = new Phaser.Game(config);

function preload()
{
    // Here we're gonna preload all images
}

function create()
{
    // We're gonna create all items 
}


function update()
{
}
