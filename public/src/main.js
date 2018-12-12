var LazerTank = LazerTank || {}

LazerTank.game = new Phaser.Game(480, 288, Phaser.AUTO, 'LazerTank');

LazerTank.game.state.add('Game', LazerTank.Game);

LazerTank.game.state.start('Game');