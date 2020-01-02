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
            const constructionSites = Memory[creep.memory.home].constructionSites;
            const cs = creep.pos.findClosestByRange(constructionSites);

            if (cs != undefined) {
                if (creep.build(cs) == ERR_NOT_IN_RANGE)
                    creep.signaledMove(cs);
            // findClosestByRange doesn't look in other rooms, so we do this
            } else if (constructionSites.length > 0) {
                let cs = Game.getObjectById(constructionSites[0].id);
                if (creep.build(cs) == ERR_NOT_IN_RANGE)
                    creep.signaledMove(cs);
            } else if (creep.room.name != creep.memory.home) {
                creep.goHome();
            } else {
                roleUpgrader.run(creep);
            }
        }
    }
};
