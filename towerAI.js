var cb = require('controlBoard');

module.exports = {
    run: function(tower) {

        // Attack the closest hostile creep
        let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target != undefined) {
            tower.attack(target);
            return;
            //console.log("HOSTILE CREEP SPOTTED");
        }

        // Heal a creep if less than 100% health
        let creep = tower.room.find(FIND_MY_CREEPS,
            {filter: (c) => c.hits < c.hitsMax});
        if (creep.length > 0) {
            tower.heal(creep[0]);
            return;
        }

        // Repair walls and ramparts until health === cb.repairWallsTo
        let targets = tower.room.find(FIND_STRUCTURES,
            {filter: (s) => (s.structureType == STRUCTURE_WALL ||
                            s.structureType == STRUCTURE_RAMPART) &&
                            s.hits < cb.repairWallsTo});
        targets = _.sortBy(targets, (t) => t.hits);
        if (targets.length) {
            tower.repair(targets[0]);
        }

        // Backup repair if a structure has less than 50% health
        targets = tower.room.find(FIND_STRUCTURES,
            {filter: (s) => s.structureType != STRUCTURE_WALL &&
                            s.structureType != STRUCTURE_RAMPART &&
                            s.hits / s.hitsMax < 0.5});
        if (targets.length > 0) {
            tower.repair(targets[0]);
            return;
        }

    }
};
