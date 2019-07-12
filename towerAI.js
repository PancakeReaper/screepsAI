var cb = require('controlBoard');

module.exports = {
    run: function(tower) {
        // Repair walls and ramparts until health === cb.repairWallsTo
        let targets = tower.room.find(FIND_STRUCTURES,
            {filter: (s) => (s.structureType == STRUCTURE_WALL ||
                            s.structureType == STRUCTURE_RAMPART) &&
                            s.hits < cb.repairWallsTo});
        targets = _.sortBy(targets, (t) => t.hits);
        if (targets.length) {
            tower.repair(targets[0]);
            return;
        }

        // Attack the closest hostile creep
        let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target != undefined) {
            tower.attack(target);
            return;
        }

        // Emergency repair if a structure has less than 5% health
        targets = tower.room.find(FIND_MY_STRUCTURES,
            {filter: (s) => s.structureType != STRUCTURE_WALL &&
                            s.structureType != STRUCTURE_RAMPART &&
                            s.hits / s.hitsMax < 0.05});
        if (targets.length) {
            tower.repair(targets[0]);
        }
    }
};
