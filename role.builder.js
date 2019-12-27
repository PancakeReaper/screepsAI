var roleUpgrader = require("role.upgrader");

module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            // Sends creep to gather energy
            creep.getEnergy(true, true, true);
        } else {
            // If there are any construction sites, build them
            const prioritySites = creep.room.find(FIND_CONSTRUCTION_SITES,
                {filter: (ps) => ps.structureType == STRUCTURE_EXTENSION ||
                                 //ps.structureType == STRUCTURE_CONTAINER ||
                                 ps.structureType == STRUCTURE_TOWER ||
                                 ps.structureType == STRUCTURE_STORAGE});
            const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);


            if (prioritySites.length > 0) {
                if (creep.build(prioritySites[0]) == ERR_NOT_IN_RANGE)
                    creep.signaledMove(prioritySites[0]);
            } else if (constructionSite != undefined) {
                if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(constructionSite);
                }
            } else {
                roleUpgrader.run(creep);
            }
        }
    }
};
