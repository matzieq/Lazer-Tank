var LazerTank = LazerTank || {}

LazerTank.Winning = function () {};

LazerTank.Winning.prototype = {
    init: function (winnerId) {
        this.winnerId = winnerId;
    },

    preload: function () {
        
    },

    create: function () {
        this.game.scale.pageAlignVertically = true;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
        this.style = {
            font: '20px Arial',
            fill: this.winnerId.toString()
        };
        this.add.text(this.game.width / 2 - 60, this.game.height / 2 - 40,
            (this.winnerId + " has won").toUpperCase(), this.style);
    },

    update: function () {
        
    }
}