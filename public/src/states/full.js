var LazerTank = LazerTank || {}

LazerTank.Full = function () {};

LazerTank.Full.prototype = {
    preload: function () {
        
    },

    create: function () {
        this.game.scale.pageAlignVertically = true;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
        this.style = {
            font: '12px Arial',
            fill: '#fff'
        };

        this.style2 = {
            font: '10px Arial',
            fill: '#fff'
        };
        this.add.text(10, this.game.height / 2 - 40,
            ("Sorry, our servers are currently crushed under incredible load").toUpperCase(), this.style);
        this.add.text(160, this.game.height / 2,
            ("Press space to restart").toUpperCase(), this.style2);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    update: function () {
        if (this.spaceKey.isDown) {
            this.game.state.start('Title');
        }
    }
}