var LazerTank = LazerTank || {}


//templatka do dziedziczenia po obiekcie sprite, mamy jeden klucz obrazka dla każdego z nich
LazerTank.PlayerTank = function (tankData, game, isLocal) {
    //Constructor call
    Phaser.Sprite.call(this, game, tankData.x, tankData.y, 'PlayerTank');
    this.startX = tankData.x;
    this.startY = tankData.y;
    this.id = tankData.id;
    this.tint = tankData.color;
    //Enabling physics
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.immovable = true;
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
    this.bulletVelocity = 200;
    this.score = 0;
    this.isLocal = isLocal;

    this.TANK_ANIMATION_SPEED = 10;
    this.TANK_VELOCITY = 70;

    //the first one is for horizontal, the second for vertical
    this.dir = {x: 0, y: -1}; 
    this.sfx = {
        engineHi: game.add.audio('enginehi', 1, true),
        engineLo: game.add.audio('enginelo', 1 ,true),
        fire: game.add.audio('fire')
    }
    
    this.style = {
        font: '20px Arial',
        fill: tankData.fontColor
    };

    this.scoreText = game.add.text(tankData.scoreX, tankData.scoreY, this.score, this.style);
    console.log(this.scoreText.text);
    // this.updateDatabase();
};

//po jakim obiekcie dziedziczy
LazerTank.PlayerTank.prototype = Object.create(Phaser.Sprite.prototype);

//przypisanie konstruktora
LazerTank.PlayerTank.prototype.constructor = LazerTank.PlayerTank;

LazerTank.PlayerTank.prototype.fire = function () {
    if (!this.bullet.alive) {
        this.sfx.fire.play();
        this.bullet.reset(this.x, this.y);
        this.bullet.angle = this.angle;
        this.bullet.body.velocity.setTo(
            this.dir.x * this.bulletVelocity, 
            this.dir.y * this.bulletVelocity
        );
    }
}

LazerTank.PlayerTank.prototype.makeNoise = function () {
    if (this.body.velocity.x || this.body.velocity.y) {
        this.sfx.engineLo.stop();
        if (!this.sfx.engineHi.isPlaying) this.sfx.engineHi.play();
    } else {
        this.sfx.engineHi.stop();
        if (!this.sfx.engineLo.isPlaying) this.sfx.engineLo.play();
    }
}

LazerTank.PlayerTank.prototype.setDir = function (x, y) {
    this.dir.x = x;
    this.dir.y = y;
    if (this.dir.x === 1) {
        this.angle = 90;
    } else if (this.dir.x === -1) {
        this.angle = -90;
    } else if (this.dir.y === 1) {
        this.angle = 180;
    } else if (this.dir.y === -1) {
        this.angle = 0;
    }
}

LazerTank.PlayerTank.prototype.move = function (dir) {
    switch (dir) {
        case 'up':
            this.setDir(0, -1);
            break;
        case 'down':
            this.setDir(0, 1);
            break;
        case 'right':
            this.setDir(1, 0);
            break;
        case 'left':
            this.setDir(-1, 0);
            break;
    }

    this.body.velocity.setTo(this.dir.x * this.TANK_VELOCITY, this.dir.y * this.TANK_VELOCITY);
    this.animations.play('drive', this.TANK_ANIMATION_SPEED, false);
}

LazerTank.PlayerTank.prototype.resetPosition = function() {
    this.reset(this.startX, this.startY)
}


LazerTank.PlayerTank.prototype.updateDatabase = function () {
    var dataToPush = {
        id: this.id,
        score: this.score,
        x: this.x,
        y: this.y,
        velocityX: this.body.velocity.x,
        velocityY: this.body.velocity.y,
        angle: this.angle,
        isFiring: this.bullet.alive,
        bulletX: this.bullet.x,
        bulletY: this.bullet.y,
        bulletAngle: this.bullet.angle
    }
    firebase.database().ref('/tanks/' + this.id).update(dataToPush);
}

LazerTank.PlayerTank.prototype.pullFromDatabase = function () {
    firebase.database().ref('/tanks').on('child_changed', response => {
        var pulledData = response.val();
        if (pulledData.id === this.id) {
            this.animations.play('drive', this.TANK_ANIMATION_SPEED, false);
            this.x = pulledData.x;
            this.y = pulledData.y;
            this.score = pulledData.score;
            this.scoreText.text = pulledData.score;
            this.body.velocity.x = pulledData.velocityX;
            this.body.velocity.y = pulledData.velocityY;
            this.angle = pulledData.angle;
            this.bullet.x = pulledData.bulletX;
            this.bullet.y = pulledData.bulletY;
            if (pulledData.isFiring && !this.bullet.alive) {
                this.sfx.fire.play();
                this.bullet.reset(pulledData.bulletX, pulledData.bulletY);
                // this.bullet.exists = true;
                this.bullet.body.velocity.setTo(
                    pulledData.dir.x * this.bulletVelocity,
                    pulledData.dir.y * this.bulletVelocity
                );
                this.bullet.angle = pulledData.bulletAngle;
            } else if (!pulledData.isFiring) {
                 this.bullet.kill();
            } 
        }
    });
}

LazerTank.PlayerTank.prototype.removeFromDatabase = function () {
    firebase.database().ref('/tanks').child(this.id).remove();
}

LazerTank.PlayerTank.prototype.increaseScore = function(amount) {
    this.score += amount;
    this.scoreText.text = this.score;
}

