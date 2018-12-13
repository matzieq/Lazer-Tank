var LazerTank = LazerTank || {}

LazerTank.game = new Phaser.Game(480, 288, Phaser.AUTO, 'LazerTank');

LazerTank.game.state.add('Game', LazerTank.Game);
LazerTank.game.state.add('Dbload', LazerTank.Dbload);
LazerTank.game.state.add('Title', LazerTank.Title);
LazerTank.game.state.add('Winning', LazerTank.Winning);

LazerTank.game.state.start('Title');