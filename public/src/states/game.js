var LazerTank = LazerTank || {}

LazerTank.Game = function () {};

LazerTank.Game.prototype = {
    init: function (tankBase) {
        this.tankBase = tankBase;
    },

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
        this.enterKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        this.wup = this.input.keyboard.addKey(Phaser.Keyboard.W);
        this.wleft = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.wdown = this.input.keyboard.addKey(Phaser.Keyboard.S);
        this.wright = this.input.keyboard.addKey(Phaser.Keyboard.D);
        
        this.TANK_VELOCITY = 70;
        this.TANK_ANIMATION_SPEED = 20;

        this.availableTanks = [
            {
                id: 'green',
                color: 0x55ff55,
                available: true,
                x: 50,
                y: 50
            },
            {
                id: 'red',
                color: 0xff5555,
                available: true,
                x: 430,
                y: 50
            },
            {
                id: 'blue',
                color: 0x5555ff,
                available: true,
                x: 430,
                y: 230
            },
            {
                id: 'yellow',
                color: 0xFFFF55,
                available: true,
                x: 50,
                y: 230
            }
        ];
        
        for (item of this.tankBase) {
            for (tank of this.availableTanks) {
                if (item.id === tank.id) {
                    tank.available = false;
                }
            }
        }

        var newTankData = null;
        for (tank of this.availableTanks) {
            if (tank.available) {
                newTankData = tank;
                break;
            }
        }
        
        this.tank = new LazerTank.PlayerTank(newTankData, this.game, true);
        this.tank.updateDatabase();
        this.enemyTanks = this.add.group();
        this.enemyBullets = this.add.group();

        firebase.database().ref('/tanks').on('child_added', response => {
            var addedTank = response.val();
            for (tank of this.availableTanks) {
                if (addedTank.id === tank.id && addedTank.id !== newTankData.id) {
                    tank.x = addedTank.x;
                    tank.y = addedTank.y;
                    var newTank = new LazerTank.PlayerTank(
                        tank, this.game, true);
                    newTank.pullFromDatabase();
                    this.enemyTanks.add(newTank);
                    console.log(newTank.bullet);
                    this.enemyBullets.add(newTank.bullet);
                }
            }
        });
        
        console.log(this.enemyBullets);
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
        this.updateTimer = this.game.time.events.loop(Phaser.Timer.SECOND / 20, this.handleDatabase, this);
        var self = this;
        window.onbeforeunload = function (e) {
            self.tank.removeFromDatabase();
        }
    },
    
    handleDatabase: function () {
    
        this.tank.updateDatabase();
        
    },

    update: function () {
        this.game.physics.arcade.collide(this.tank, this.terrainLayer);
        this.game.physics.arcade.collide(this.tank, this.waterLayer);
        
        // this.game.physics.arcade.collide(this.tank.bullet, this.terrainLayer);
        this.game.physics.arcade.collide(this.tank.bullet, this.terrainLayer, function (bullet, terrain) {
            bullet.kill();
        }, null, this);
        this.game.physics.arcade.collide(this.tank.bullet, this.enemyTanks, function (bullet, tank) {
            bullet.kill();
        }, null, this);

        
        this.game.physics.arcade.collide(this.enemyBullets, this.tank, function (tank, bullet) {
            bullet.kill();
            console.log(tank);
            tank.reset(tank.startX, tank.startY)
            tank.updateDatabase();
        }, null, this);
        

        this.game.physics.arcade.collide(this.enemyTanks, this.terrainLayer, function (tank, terrain) {
            tank.body.velocity.setTo(0, 0);
        }, null, this);
        this.game.physics.arcade.collide(this.enemyTanks, this.waterLayer, function (tank, terrain) {
            tank.body.velocity.setTo(0, 0);
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
       

        if (this.spaceKey.isDown) {
            
            this.tank.fire();
        }
        
    }
}