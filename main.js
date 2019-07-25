require("prototype.creep");
require("prototype.spawner");
var towerAI = require("towerAI");
var cb = require("controlBoard");

module.exports.loop = function () {
    // --------------------------------------- TODO LIST --------------------------------------- //
    // TODO: Create better? flee move function for creep
    // TODO: Have creeps put a target into memory instead of finding it again every tick [HIGH PRIORITY]
    //             DONE FOR HARVESTER, LOGISTIC,

    let creepCount = {};
    // --------------------------------------- ROOM AI --------------------------------------- //
    for (const name in Game.rooms) {
        room = Game.rooms[name];
        if (room.storage != undefined)
            room.visual.text(room.storage.store[RESOURCE_ENERGY], room.storage.pos);

        creepCount[name] = {};
        for (const role of cb.listOfRoles) {
            creepCount[name][role] = 0;
        }
    }

    // --------------------------------------- SPAWN AI --------------------------------------- //
    for (const name in Game.spawns) {
        //Game.spawns[name].update();
        Game.spawns[name].spawnIfNeeded();
        //Game.spawns[name].analysis();

        if (creepCount[Game.spawns[name].room.name] == undefined) {
            creepCount[Game.spawns[name].room.name] = {};
        }

    }

    // --------------------------------------- CREEP AI --------------------------------------- //
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        // Create a javascipt object for counting creeps
        let roomEntry = creepCount[creep.memory.home][creep.memory.role];
        if (roomEntry != undefined)
            creepCount[creep.memory.home][creep.memory.role] += 1;
        else
            creepCount[creep.memory.home][creep.memory.role] = 0;

//        if (creep.memory.role == 'healer') {
//            creep.memory.target = "W34N2";
//        }

        creep.doRole();
    }
    // Load creep information into memory
    Memory.creepCount = creepCount;



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
