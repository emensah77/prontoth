class Turret {
    constructor(id, position_x, position_y, level = 1) {
        this.id = id;
        this.position_x = position_x;
        this.position_y = position_y;
        this.level = level;
    }
}

module.exports = Turret;
