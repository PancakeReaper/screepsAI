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

    var colonyW22S44 = new Colony("W22S44");
    colonyW22S44.loop();
    Memory["W22S44"] = colonyW22S44;

    let creepCount = {}; // move creep count into Colony.js
    // --------------------------------------- ROOM AI --------------------------------------- //
    for (const name in Game.rooms) {
        room = Game.rooms[name];
        //room.makeRoads(Game.spawns.Spawn1);
        if (room.storage != undefined)
            room.visual.text(room.storage.store[RESOURCE_ENERGY], room.storage.pos);

        // Set up creep count tracker for each room
        creepCount[name] = {};
        for (const role of cb.listOfRoles) {
            creepCount[name][role] = 0;
        }
    }

    // --------------------------------------- SPAWN AI --------------------------------------- //
    for (const name in Game.spawns) {
        if (creepCount[Game.spawns[name].room.name] == undefined) {
            creepCount[Game.spawns[name].room.name] = {};
        }

        //Game.spawns[name].update();
        Game.spawns[name].spawnIfNeeded();
        //Game.spawns[name].analysis();
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
