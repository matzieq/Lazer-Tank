var LazerTank = LazerTank || {}

LazerTank.Game = function () {};

LazerTank.Game.prototype = {
    preload: function () {
        this.load.spritesheet('PlayerTank', "./img/PlayerTank.png", 16, 16, 3);
        this.load.image('Bullet', "./img/Bullet.png");
        this.load.image('Brick', "./img/Bricks.png");
        this.load.image('Tiles', "./img/TankTerrain.png");

        this.load.tilemap('brickmap', './map/bricksForTank.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('terrainLevel1', './map/terrainLevel1.json', null, Phaser.Tilemap.TILED_JSON);

        this.load.audio('enginehi', './snd/engine.wav');
        this.load.audio('enginelo', './snd/enginelow.wav');
        this.load.audio('fire', './snd/fire.wav');
    },
    
    create: function () {
        this.adjustGameScale();
        this.enableCrispRendering();
        
        console.log(this.game);
        console.log(this.tank);
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        this.TANK_VELOCITY = 100;
        this.TANK_ANIMATION_SPEED = 20;
        
        this.tank = new LazerTank.PlayerTank(this.game, 100, 100);

        // this.map = this.add.tilemap('brickmap');
        this.map = this.add.tilemap('terrainLevel1');
        console.log(this.map);
        // this.map.addTilesetImage('bricks', 'Brick');
        this.map.addTilesetImage('TankTerrain', 'Tiles');
        // this.layer = this.map.createLayer('bricks');
        this.metalLayer = this.map.createLayer('metal');
        this.waterLayer = this.map.createLayer('water');
        this.bushLayer = this.map.createLayer('bushes');
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