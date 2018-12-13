var LazerTank = LazerTank || {}

LazerTank.Title = function () {};

LazerTank.Title.prototype = {
    preload: function () {
        this.load.image('LogoTop', './img/logotop.png');
        this.load.image('LogoBottom', './img/logobot.png');
        this.load.audio('Bang', './snd/bang.wav');
        this.load.audio('Pling', './snd/pling.wav');
        this.load.audio('Explode', './snd/explode.wav');
    },
    
    create: function () {
        this.adjustScaleAndRendering();
        this.createAudio();
        this.createStyles();

        this.logoTop = this.add.sprite(this.game.width / 2 + 10, -200, 'LogoTop');
        this.logoBottom = this.add.sprite(this.game.width / 2 + 14, 400, 'LogoBottom');
        this.isGameStarting = false;

        this.animateLogo();
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); 
    },

    update: function () {
        if (this.spaceKey.isDown && !this.isGameStarting) {
            this.isGameStarting = true;
            this.bangSound.play();
            this.plingSound.play();

            if (this.startGameText) this.startGameText.destroy();
            this.add.tween(this.logoBottom).to({
                y: 500
            }, 500, Phaser.Easing.Linear.None, true);
            this.add.tween(this.logoTop).to({
                y: -100
            }, 500, Phaser.Easing.Linear.None, true)
                .onComplete.add(function () {
                    this.state.start('Dbload');
                }, this);
        }
    },

    
    adjustScaleAndRendering: function() {
        this.game.scale.pageAlignVertically = true;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    },

    createAudio: function () {
        this.bangSound = this.add.audio('Bang');
        this.plingSound = this.add.audio('Pling');
        this.explodeSound = this.add.audio('Explode');
    },

    createStyles: function () {
        this.style = {
            font: '12px Arial',
            fill: '#fff'
        };

        this.styleCredits = {
            font: '10px Arial',
            fill: '#fff'
        };
    },

    animateLogo: function () {
        var topTween = this.add.tween(this.logoTop).to({
            y: this.game.height / 2 - 50
        }, 500, Phaser.Easing.Linear.None, true);
        this.game.time.events.add(Phaser.Timer.SECOND * 1.5, function () {
            this.startGameText = this.game.add.text(this.game.width / 2 - 60, this.game.height / 2,
                'PRESS SPACE TO START', this.style);
            this.creditsText = this.game.add.text(this.game.width / 2 - 50, this.game.height / 2 + 100,
                'gfx, snd & prg by matzieq', this.styleCredits);
            // this.creditsText.scale.setTo(0.5, 0.5);
            this.add.tween(this.startGameText).to({ alpha: 0 }, 500, "Linear", true, 0, -1, true);
            this.explodeSound.play();
        }, this);
        topTween.onComplete.add(function () {
            this.bangSound.play();
            this.plingSound.play();
            this.bottomTween = this.add.tween(this.logoBottom).to({
                y: this.game.height / 2 - 14
            }, 500, Phaser.Easing.Linear.None, true).onComplete.add(function () {
                this.bangSound.play();
                this.plingSound.play();                              
            }, this);
        }, this);        
        this.logoTop.anchor.setTo(0.5);
        this.logoBottom.anchor.setTo(0.5);
    }
}