var LazerTank = LazerTank || {}

LazerTank.Dbload = function () {};

LazerTank.Dbload.prototype = {
    preload: function () {
        this.tankBase = [];
        firebase.database().ref('/tanks').once('value', response => {
            response.forEach(item => {
                this.tankBase.push(item.val());
            });
            console.log(this.tankBase);
            this.state.start('Game', true, false, this.tankBase);
        });
    },

    create: function () {
        
    },

    update: function () {
        
    }
}