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
        this.load.image('Smoke', "./img/Smoke.png");

        this.load.tilemap('brickmap', './map/bricksForTank.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('terrainLevel1', './map/terrainLevel1.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('waterLevel1', './map/waterLevel1.json', null, Phaser.Tilemap.TILED_JSON);

        this.load.audio('enginehi', './snd/engine.wav');
        this.load.audio('enginelo', './snd/enginelow.wav');
        this.load.audio('fire', './snd/fire.wav');
        this.load.audio('explode', './snd/explode.wav');
        
    },
    
    

    create: function () {
        this.adjustGameScale();
        this.enableCrispRendering();
        this.loadKeys();
        this.loadTankInfo();   
        this.createTanks();
        this.loadMaps();
        this.TIME_BETWEEN_UPDATES = 5;
        //the only global sound
        this.explode = this.add.audio('explode');

        //timer for updating the database with tank data
        this.updateTimer = this.TIME_BETWEEN_UPDATES;
        // this.updateTimer = this.game.time.events.loop(Phaser.Timer.SECOND / 10, this.handleDatabase, this);

        //if the player closes the window we should clear tank data
        this.removeTankIfUnloading();        
    },
    
    
    update: function () {
        this.handleCollisions();
        this.handleInput();
        // this.tank.updateDatabase();
        this.handleDatabase();
        this.tank.makeNoise();      
    },

    handleDatabase: function () {
        if(--this.updateTimer < 0) {
            this.updateTimer = this.TIME_BETWEEN_UPDATES;
            this.tank.updateDatabase();
        }
    },
    
    handleCollisions: function () {
        this.collideWithTerrain();
        this.collideWithObjects();
        this.enemyTanks.forEach(function(tank) {
            this.fixPosition(tank);
        }, this);
    },

    collideWithTerrain: function () {
        this.game.physics.arcade.collide(this.tank, this.terrainLayer);
        this.game.physics.arcade.collide(this.tank, this.waterLayer);

        this.game.physics.arcade.collide(this.tank.bullet, this.terrainLayer, function (bullet, terrain) {
            bullet.kill();
        }, null, this);

        this.game.physics.arcade.collide(this.enemyTanks, this.terrainLayer, function (tank, terrain) {
            tank.body.velocity.setTo(0, 0);
        }, null, this);

        this.game.physics.arcade.collide(this.enemyTanks, this.waterLayer, function (tank, terrain) {
            tank.body.velocity.setTo(0, 0);
        }, null, this);
    },

    collideWithObjects: function () {
        this.game.physics.arcade.collide(this.tank, this.enemyTanks, function(playerTank, enemyTank) {
            this.explode.play();
            // playerTank.resetPosition();
            // enemyTank.resetPosition();
            this.animateCollision(playerTank);
            playerTank.updateDatabase();
            // enemyTank.updateDatabase();
        }, null, this);
        
        
        this.game.physics.arcade.collide(this.tank.bullet, this.enemyTanks, function (bullet, tank) {
            bullet.kill();
            // tank.resetPosition();
            tank.updateDatabase();
            this.explode.play();
            this.makeExplosion(tank.x, tank.y);
            //the score is increased only if the other player is not in the middle of spinning out of control
            if (tank.controlled) this.tank.increaseScore(1);
        }, null, this);

        
        this.game.physics.arcade.collide(this.enemyBullets, this.tank, function (tank, bullet) {
            bullet.kill();
            this.explode.play();
            // tank.resetPosition();
            this.animateCollision(tank);
            tank.updateDatabase();
        }, null, this);
    },

    animateCollision: function (tank) {
        if (tank.controlled) {
            tank.controlled = false
            this.makeExplosion(tank.x, tank.y);
            var destroyTween = this.add.tween(tank).to({
                x: tank.x + this.game.rnd.between(-5, 5) * 20,
                y: tank.y + this.game.rnd.between(-5, 5) * 20,
                rotation: 5
                }, 500, Phaser.Easing.Linear.None, true);
            destroyTween.onComplete.add(function () {
                tank.controlled = true;
                this.fixPosition(tank);         
            }, this);
        }
    },

    makeExplosion: function (x, y) {
        var explosionEmitter = this.game.add.emitter(x, y, 200);
        explosionEmitter.makeParticles('Smoke');
        explosionEmitter.start(true, 1000, null, 200);
    },

    fixPosition: function (tank) {
        if (
            tank.x < 0 || 
            tank.x > this.game.world.width ||
            tank.y < 0 ||
            tank.y > this.game.world.height
        ) {
            tank.alpha = 0;
            tank.resetPosition();
            this.add.tween(tank).to({
                alpha: 1
            }, 2000, Phaser.Easing.Linear.None, true);
        }
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
        
    },

    loadTankInfo: function () {
        this.availableTanks = [
            {
                id: 'green',
                color: 0x55ff55,
                fontColor: '#55ff55',
                available: true,
                x: 50,
                y: 50,
                scoreX: 20,
                scoreY: 20
            },
            {
                id: 'red',
                color: 0xff5555,
                fontColor: '#ff5555',
                available: true,
                x: 430,
                y: 50,
                scoreX: 450,
                scoreY: 20
            },
            {
                id: 'blue',
                color: 0x5555ff,
                fontColor: '#5555ff',
                available: true,
                x: 430,
                y: 230,
                scoreX: 450,
                scoreY: 250
            },
            {
                id: 'yellow',
                color: 0xFFFF55,
                fontColor: '#ffff55',
                available: true,
                x: 50,
                y: 230,
                scoreX: 20,
                scoreY: 250
            }
        ];
    },

    createTanks: function () {
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
        this.addTankToDatabase(newTankData);
        
    },

    addTankToDatabase: function (newTankData) {
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
    },

    loadKeys: function () {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    loadMaps: function () {
        //rock and bushes
        this.map = this.add.tilemap('terrainLevel1');
        this.map.addTilesetImage('TankTerrain', 'Tiles');
        this.terrainLayer = this.map.createLayer('collision');
        this.bushLayer = this.map.createLayer('bushes');

        //water - must be separate because collisions work differently
        this.waterMap = this.add.tilemap('waterLevel1');
        this.waterMap.addTilesetImage('TankTerrain', 'Tiles');
        this.waterLayer = this.waterMap.createLayer('water');

        //bullets must be shown flying over water
        this.game.world.sendToBack(this.waterLayer);

        //setting collisions
        this.map.setCollisionBetween(1, 1000, true, 'collision');
        this.waterMap.setCollisionBetween(1, 1000, true, 'water');
        
    },

    removeTankIfUnloading: function () {
        var self = this;
        window.onbeforeunload = function (e) {
            self.tank.removeFromDatabase();
            self.tank.kill();
        }
    }
}