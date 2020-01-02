require("prototype.creep");
require("prototype.spawner");
require("prototype.room");
var towerAI = require("towerAI");
var cb = require("controlBoard");

var Colony = require("class.colony");

module.exports.loop = function () {
    // --------------------------------------- TODO LIST --------------------------------------- //
    // TODO: Add a Colony class to manage multiroom operations
    //          - Refactor entire spawning algo into Colony class
    //          - Scout role + Hauler role
    // TODO: Make spawner build creeps by % and not by parts
    // TODO: Have creeps put a target into memory instead of finding it again every tick [HIGH PRIORITY]
    //             DONE FOR HARVESTER, LOGISTIC,

    for (const room of Object.values(Game.rooms)) {
        // If you own this room
        if (room.controller.my) {
            let colony = new Colony(room.name);
            colony.loop();
            Memory[room.name] = colony;
        }
    }

    // --------------------------------------- TOWER AI --------------------------------------- //
    const towers = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TOWER);
    for (const tower of towers) {
        towerAI.run(tower);
    }

    // --------------------------------------- MEMORY CLEAR --------------------------------------- //
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
        }
    }
};
