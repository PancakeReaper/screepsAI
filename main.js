require("prototype.creep");
require("prototype.spawner");
var towerAI = require("towerAI");
var cb = require("controlBoard");

module.exports.loop = function () {
    // --------------------------------------- TODO LIST --------------------------------------- //
    // TODO: Create better? flee move function for creep
    // TODO: Have creeps store a path in memory
    // TODO: Put a hash in every spawner keeping track of every creep it owns,
    //          updates by iterating through Game.creeps

    // --------------------------------------- SPAWN AI --------------------------------------- //
    let creepCount = {};
    for (const name in Game.spawns) {
        //Game.spawns[name].update();
        Game.spawns[name].spawnIfNeeded();
        //Game.spawns[name].analysis();

        if (creepCount[Game.spawns[name].room.name] == undefined) {
            creepCount[Game.spawns[name].room.name] = {};
            for (const role of cb.listOfRoles) {
                creepCount[Game.spawns[name].room.name][role] = 0;
            }
        }
    }

    // --------------------------------------- CREEP AI --------------------------------------- //
    // TODO: Fix this method of couting creep's tendancy to give undefined for roles with 0
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        // Create a javascipt object for counting creeps
        let roomEntry = creepCount[creep.memory.home][creep.memory.role];
        if (roomEntry == undefined)
            console.log("ERROR found a invalid role: " + creep.memory.role);
        else
            creepCount[creep.memory.home][creep.memory.role] += 1;

        creep.doRole();
    }
    // Load creep information into memory
    Memory.creepCount = creepCount;



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

            /*
        const critials = room.find(FIND_STRUCTURES,
            {filter: (s) => s.structureType != STRUCTURE_WALL &&
                            s.structureType != STRUCTURE_RAMPART &&
                            s.hits < s.hitsMax});
        for (let critical of critials) {
            critical.room.visual.text("X", critical.pos, {color:'#ff0000'});
        }
        */
    }

    // --------------------------------------- MEMORY CLEAR --------------------------------------- //
    for (let name in Memory.creeps) {
        if (Game.creeps[name] == undefined) {
            delete Memory.creeps[name];
        }
    }
};
