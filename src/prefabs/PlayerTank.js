var LazerTank = LazerTank || {}


//templatka do dziedziczenia po obiekcie sprite, mamy jeden klucz obrazka dla każdego z nich
LazerTank.PlayerTank = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'sprite-key');
    //custom params, np.
    this.anchor.setTo(0.5);
};

//po jakim obiekcie dziedziczy
LazerTank.PlayerTank.prototype = Object.create(Phaser.Sprite.prototype);

//przypisanie konstruktora
LazerTank.PlayerTank.prototype.constructor = LazerTank.PlayerTank;