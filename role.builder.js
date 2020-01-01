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
            //const prioritySites = Memory[creep.memory.home].constructionSites;
            const constructionSites = Memory[creep.memory.home].constructionSites;
            const cs = creep.pos.findClosestByRange(constructionSites);
            //if (Memory[creep.memory.home] != undefined) {
            //    prioritySites = Memory[creep.memory.home].constructionSites.filter((ps) {
            //        return ps.structureType === STRUCTURE_EXTENSION
            //    });
            //    constructionSites = Memory[creep.memory.home].constructionSites;
            //}

            //const prioritySites = creep.room.find(FIND_CONSTRUCTION_SITES,
            //    {filter: (ps) => ps.structureType == STRUCTURE_EXTENSION ||
            //                     //ps.structureType == STRUCTURE_CONTAINER ||
            //                     ps.structureType == STRUCTURE_TOWER ||
            //                     ps.structureType == STRUCTURE_STORAGE});
            //const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);


            if (cs != undefined) {
                if (creep.build(cs) == ERR_NOT_IN_RANGE)
                    creep.signaledMove(cs);
            } else if (constructionSites.length > 0) {  // allow for multi-room building
                if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE)
                    creep.signaledMove(constructionSites[0]);
            //} else if (constructionSite != undefined) {
            //    if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
            //        creep.signaledMove(constructionSite);
            //    }
            // }
            } else if (creep.room.name != creep.memory.home) {
                creep.goHome();
            } else {
                roleUpgrader.run(creep);
            }
        }
    }
};
