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
        this.load.tilemap('waterLevel1', './map/waterLevel1.json', null, Phaser.Tilemap.TILED_JSON);

        this.load.audio('enginehi', './snd/engine.wav');
        this.load.audio('enginelo', './snd/enginelow.wav');
        this.load.audio('fire', './snd/fire.wav');
    },
    
    create: function () {
        this.adjustGameScale();
        this.enableCrispRendering();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        this.TANK_VELOCITY = 70;
        this.TANK_ANIMATION_SPEED = 20;
        
        this.tank = new LazerTank.PlayerTank(this.game, 100, 100);

        // this.map = this.add.tilemap('brickmap');
        this.map = this.add.tilemap('terrainLevel1');
        this.waterMap = this.add.tilemap('waterLevel1');
        // this.map.addTilesetImage('bricks', 'Brick');
        this.map.addTilesetImage('TankTerrain', 'Tiles');
        this.waterMap.addTilesetImage('TankTerrain', 'Tiles');
        // this.layer = this.map.createLayer('bricks');
        this.terrainLayer = this.map.createLayer('collision');
        this.waterLayer = this.waterMap.createLayer('water');
        this.map.setCollisionBetween(1, 1000, true, 'collision');
        this.waterMap.setCollisionBetween(1, 1000, true, 'water');
        this.game.world.sendToBack(this.waterLayer);
        this.bushLayer = this.map.createLayer('bushes');
    },
    
    update: function () {
        this.game.physics.arcade.collide(this.tank, this.terrainLayer);
        this.game.physics.arcade.collide(this.tank, this.waterLayer);
        // this.game.physics.arcade.collide(this.tank.bullet, this.terrainLayer);
        this.game.physics.arcade.collide(this.tank.bullet, this.terrainLayer, function (bullet, terrain) {
            bullet.kill();
        }, null, this);
        this.handleInput();
        this.tank.makeNoise();
    },

    adjustGameScale: function () {
        this.game.scale.pageAlignVertically = true;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    },

    enableCrispRendering: function () {
        this.game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    },

    handleInput: function () {
        this.tank.body.velocity.setTo(0, 0);
        if (this.cursors.up.isDown) {
            this.tank.move('up');
        } else if (this.cursors.down.isDown) {
            this.tank.move('down');
        } else if (this.cursors.left.isDown) {
            this.tank.move('left');
        } else if (this.cursors.right.isDown) {  
            this.tank.move('right');
        }
        if (this.spaceKey.isDown) {
            this.tank.fire();
        }
    }
}