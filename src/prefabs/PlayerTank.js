var LazerTank = LazerTank || {}


//templatka do dziedziczenia po obiekcie sprite, mamy jeden klucz obrazka dla każdego z nich
LazerTank.PlayerTank = function (game, x, y) {

    //Constructor call
    Phaser.Sprite.call(this, game, x, y, 'PlayerTank');
    //Enabling physics
    game.physics.enable(this, Phaser.Physics.ARCADE);

    //We must add it to the game
    game.add.existing(this);

    //Various initial parameters
    this.anchor.setTo(0.5);
    this.body.collideWorldBounds = true;
    this.drive = this.animations.add('drive');

    //Every tank has just one bullet, so I'm declaring it here
    this.bullet = game.add.sprite(this.x, this.y, 'Bullet');
    game.physics.enable(this.bullet, Phaser.Physics.ARCADE);
    this.bullet.anchor.setTo(0.5);
    this.bullet.checkWorldBounds = true;
    this.bullet.outOfBoundsKill = true;
    this.bullet.kill();

    //Variables and constants
    this.bulletVelocity = 300;
    
    //the first one is for horizontal, the second for vertical
    this.dir = {x: 0, y: -1}; 
    this.sfx = {
        engineHi: game.add.audio('enginehi', 1, true),
        engineLo: game.add.audio('enginelo', 1 ,true),
        fire: game.add.audio('fire')
    }
};

//po jakim obiekcie dziedziczy
LazerTank.PlayerTank.prototype = Object.create(Phaser.Sprite.prototype);

//przypisanie konstruktora
LazerTank.PlayerTank.prototype.constructor = LazerTank.PlayerTank;

LazerTank.PlayerTank.prototype.fire = function () {
    console.log(this.game);
    if (!this.bullet.alive) {
        this.sfx.fire.play();
        this.bullet.reset(this.x, this.y);
        this.bullet.angle = this.angle;
        console.log(this.angle);
        this.bullet.body.velocity.setTo(
            this.dir.x * this.bulletVelocity, 
            this.dir.y * this.bulletVelocity
        );
    } 
}

LazerTank.PlayerTank.prototype.makeNoise = function () {
    if (this.body.velocity.x || this.body.velocity.y) {
        this.sfx.engineLo.stop();
        this.sfx.engineHi.play();
    } else {
        this.sfx.engineHi.stop();
        if (!this.sfx.engineLo.isPlaying) this.sfx.engineLo.play();
    }
}