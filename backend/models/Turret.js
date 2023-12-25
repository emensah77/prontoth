class Turret {
    constructor(id, position_x, position_y, level = 1, poppedLoons = 0) {
        this.id = id;
        this.position_x = position_x;
        this.position_y = position_y;
        this.level = level;
        this.poppedLoons = poppedLoons; // Track number of popped loons
    }

    upgrade() {
        if (this.poppedLoons >= 5) {
            this.level++;
        }
    }

    popLoon() {
        this.poppedLoons++;
    }
}

module.exports = Turret;
