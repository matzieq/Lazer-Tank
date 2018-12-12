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
        this.tankBase = [];
        firebase.database().ref('/tanks').on('child_added', response => {
            this.tankBase.push(response.val());
        });
        console.log(this.tankBase);
    },
    
    create: function () {
        this.adjustGameScale();
        this.enableCrispRendering();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.enterKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        this.wup = this.input.keyboard.addKey(Phaser.Keyboard.W);
        this.wleft = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.wdown = this.input.keyboard.addKey(Phaser.Keyboard.S);
        this.wright = this.input.keyboard.addKey(Phaser.Keyboard.D);
        
        this.TANK_VELOCITY = 70;
        this.TANK_ANIMATION_SPEED = 20;

        var availableColors = ['green', 'yellow', 'blue', 'red'];
        
        this.tank = new LazerTank.PlayerTank('yellow', this.game, 100, 100, true);
        this.tankTwo = new LazerTank.PlayerTank('red', this.game, 100, 150, false);
        this.tankTwo.tint = 0xff9999;


        this.map = this.add.tilemap('terrainLevel1');
        this.waterMap = this.add.tilemap('waterLevel1');
        this.map.addTilesetImage('TankTerrain', 'Tiles');
        this.waterMap.addTilesetImage('TankTerrain', 'Tiles');
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
        this.game.physics.arcade.collide(this.tankTwo, this.terrainLayer);
        this.game.physics.arcade.collide(this.tankTwo, this.waterLayer);
        // this.game.physics.arcade.collide(this.tank.bullet, this.terrainLayer);
        this.game.physics.arcade.collide(this.tank.bullet, this.terrainLayer, function (bullet, terrain) {
            bullet.kill();
        }, null, this);
        this.game.physics.arcade.collide(this.tankTwo.bullet, this.terrainLayer, function (bullet, terrain) {
            bullet.kill();
        }, null, this);
        this.handleInput();
        this.tank.makeNoise();


        this.game.physics.arcade.collide(this.tank, this.tankTwo);
        this.game.physics.arcade.collide(this.tank.bullet, this.tankTwo, function (bullet, tank) {
            bullet.kill();
            tank.resetPosition();
        }, null, this);
        this.game.physics.arcade.collide(this.tankTwo.bullet, this.tank, function (bullet, tank) {
            bullet.kill();
            tank.resetPosition();
        }, null, this);
        this.tank.updateDatabase();
        this.tankTwo.pullFromDatabase();
        // this.tankTwo.updateDatabase();
        this.tank.pullFromDatabase();
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
        // console.log(this.tank.x, this.tank.y);
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
        this.tankTwo.body.velocity.setTo(0, 0);
        if (this.wup.isDown) {
            this.tankTwo.move('up');
        } else if (this.wdown.isDown) {
            this.tankTwo.move('down');
        } else if (this.wleft.isDown) {
            this.tankTwo.move('left');
        } else if (this.wright.isDown) {  
            this.tankTwo.move('right');
        }


        if (this.spaceKey.isDown) {
            console.log(this.tankBase);
            this.tank.fire();
        }
        if (this.enterKey.isDown) {
            this.tankTwo.fire();
        }
    }
}