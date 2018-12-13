var LazerTank = LazerTank || {}

LazerTank.Dbload = function () {};

LazerTank.Dbload.prototype = {
    preload: function () {
        this.tankBase = [];
        firebase.database().ref('/tanks').once('value', response => {
            response.forEach(item => {
                this.tankBase.push(item.val());
            });
            
            this.state.start('Game', true, false, this.tankBase);
        });
    },

    create: function () {
        this.game.scale.pageAlignVertically = true;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.renderer.renderSession.roundPixels = true;
        this.style = {
            font: '30px Arial',
            fill: '#fff'
        };
        this.game.add.text(
            this.game.width / 2, 
            this.game.height / 2 - 10, 
            "CONNECTING...", 
            this.style
        ).anchor.setTo(0.5);

    },

    update: function () {
        
    }
}