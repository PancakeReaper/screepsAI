require("prototype.creep");
require("prototype.spawner");
var towerAI = require("towerAI");

module.exports.loop = function () {
    // --------------------------------------- CREEP AI --------------------------------------- //
    for (const name in Game.creeps) {
        Game.creeps[name].doRole();
    }

    // --------------------------------------- SPAWN AI --------------------------------------- //
    for (const name in Game.spawns) {
        Game.spawns[name].update();
        Game.spawns[name].spawnIfNeeded();
        //Game.spawns[name].analysis();
    }

    // --------------------------------------- TOWER AI --------------------------------------- //
    const towers = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TOWER);
    for (const tower of towers) {
        towerAI.run(tower);
    }

    // --------------------------------------- ROOM AI --------------------------------------- //
    for (const name in Game.rooms) {
        room = Game.rooms[name];
        if (room.storage != undefined)
            room.visual.text(room.storage.store[RESOURCE_ENERGY], room.storage.pos);
    }

    // --------------------------------------- MEMORY CLEAR --------------------------------------- //
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
        }
    }
};
