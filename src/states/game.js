var LazerTank = LazerTank || {}

LazerTank.Game = function () {};

LazerTank.Game.prototype = {
    preload: function () {
        this.load.spritesheet('PlayerTank', "./img/PlayerTank.png", 16, 16, 3);
        this.load.image('Bullet', "./img/Bullet.png");
        this.load.image('Brick', "./img/Bricks.png");
        this.load.tilemap('brickmap', './map/bricksForTank.json', null, Phaser.Tilemap.TILED_JSON);

        this.load.audio('enginehi', './snd/engine.wav');
        this.load.audio('enginelo', './snd/enginelow.wav');
        this.load.audio('fire', './snd/fire.wav');
    },
    
    create: function () {
        this.adjustGameScale();
        this.enableCrispRendering();
        
        console.log(this.game);
        this.tank = new LazerTank.PlayerTank(this.game, 100, 100);
        console.log(this.tank);
        this.cursors = this.input.keyboard.createCursorKeys();

        this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.TANK_VELOCITY = 100;
        this.TANK_ANIMATION_SPEED = 20;

        var game = this.game;
        this.map = this.add.tilemap('brickmap');
        console.log(this.map);
        this.map.addTilesetImage('bricks', 'Brick');
        this.layer = this.map.createLayer('bricks');
        console.log(this.layer);
        this.layer.resizeWorld();

    },

    update: function () {
        this.handleInput();
        this.tank.makeNoise();
    },

    adjustGameScale: function () {
        // this.game.scale.pageAlignVertically = true;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    },

    enableCrispRendering: function () {
        this.game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    },

    handleInput: function () {
        this.tank.body.velocity.y = 0;
        this.tank.body.velocity.x = 0;
        if (this.cursors.up.isDown) {
            this.tank.body.velocity.y = -this.TANK_VELOCITY;
            this.tank.angle = 0;
            this.tank.dir.x = 0;
            this.tank.dir.y = -1;
            this.tank.animations.play('drive', this.TANK_ANIMATION_SPEED, false);
        } else if (this.cursors.down.isDown) {
            this.tank.body.velocity.y = this.TANK_VELOCITY;
            this.tank.angle = 180;
            this.tank.dir.x = 0;
            this.tank.dir.y = 1;
            this.tank.animations.play('drive', this.TANK_ANIMATION_SPEED, false);
        } else if (this.cursors.left.isDown) {
            this.tank.body.velocity.x = -this.TANK_VELOCITY;
            this.tank.angle = 270;
            this.tank.dir.x = -1;
            this.tank.dir.y = 0;
            this.tank.animations.play('drive', this.TANK_ANIMATION_SPEED, false);
        } else if (this.cursors.right.isDown) {
            this.tank.body.velocity.x = this.TANK_VELOCITY;
            this.tank.angle = 90;
            this.tank.dir.x = 1;
            this.tank.dir.y = 0;
            this.tank.animations.play('drive', this.TANK_ANIMATION_SPEED, false);
        }
       
        if (this.spaceKey.isDown) {
            
            this.tank.fire();
        }
    }
}