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
            const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

            if (constructionSite != undefined) {
                if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    creep.signaledMove(constructionSite);
                }
            } else {
                roleUpgrader.run(creep);
            }
        }
    }
};
