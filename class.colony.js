var cb = require('controlBoard');

/**
 * Manages the object properties for an object at Memory.Colonies.Colony
 * Colony = {
 *   mainRoomName
 *   rooms
 *   containers
 *   creepCount
 *
 *   quarries
 *   haulers
 *
 *   spawnQueue
 *   spawns
 *
 *
 *
 */
class Colony {
    constructor(mainRoomName) {
        this.mainRoomName = mainRoomName;
        this.neighborRooms = [];  // Rooms not in control but nearby
        this.roomsInControl = [];  // All rooms in control (including main)
        this.creepCount = {};

        // Energy collection
        this.quarryContainers = [];
        this.quarryCreeps = [];
        this.haulerCreeps;

        // Cluster management
        this.spawnQueue = (Memory[mainRoomName] == undefined ? [] : Memory[mainRoomName].spawnQueue);
        this.spawning = (Memory[mainRoomName] == undefined ? [] : Memory[mainRoomName].spawning);
        this.spawns = [];

        // Cached variables
        this.allStructures = [];
        this.constructionSites = [];
        this.availableQuarrySites;
        this.energyStructures;

        // ---------------- Initialization ---------------- //
        let neighbors = Game.rooms[mainRoomName].getNeighborRooms();
        for (const neighborRoomName of neighbors) {
            let room = Game.rooms[neighborRoomName];
            if (room != undefined && room.controller.reservation != undefined &&
                        (room.controller.my || room.controller.reservation.username === cb.USERNAME)) {
                this.roomsInControl.push(neighborRoomName);
            } else {
                this.neighborRooms.push(neighborRoomName);
            }
        }
        this.roomsInControl.push(mainRoomName);

        for (const role of cb.listOfRoles) {
            this.creepCount[role] = 0;
        }
        for (const roomName of this.roomsInControl) {
            let checkingRoom = Game.rooms[roomName];
            //console.log("Checking room " + checkingRoom);
            if (checkingRoom != undefined) {
                // Doing creep count of entire colony //
                let creeps = checkingRoom.find(FIND_MY_CREEPS);
                for (const creep of creeps) {
                    this.creepCount[creep.memory.role] += 1;

                    // Counting quarry creeps
                    if (creep.memory.role == 'quarry')
                        this.quarryCreeps.push(creep);
                }

                // Doing structure count of evything under colony control //
                this.constructionSites = this.constructionSites.concat(checkingRoom.find(FIND_MY_CONSTRUCTION_SITES));

                //this.allStructures = this.allStructures.concat(checkingRoom.find(FIND_STRUCTURES));
                this.quarryContainers = this.quarryContainers.concat(checkingRoom.find(FIND_STRUCTURES,
                        {filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                            !s.pos.lookFor(LOOK_CREEPS).length &&
                            s.pos.findInRange(FIND_SOURCES, 2).length > 0}))

                // Counting Spawns
                this.spawns = this.spawns.concat(checkingRoom.find(FIND_MY_STRUCTURES,
                        {filter: (s) => s.structureType == STRUCTURE_SPAWN}));
            }
        }
    }

    /**
     * Main loop more colony variable/memory management and decisions
     * (is split into 2 function mainRoomLoop() and targetRoomsLoop())
     */
    loop() {
        this._checkToSpawnQuarries();
        if (this.spawnQueue.length > 0)
            this._sendSpawnOrder(this.spawnQueue[0]);
    }
    // Manages everything in the home room
    mainRoomLoop() {
        // TODO
    }
    // Manages everything in the extended rooms
    targetRoomsLoop() {
        // TODO
        // Have enough quarries, repairers, and defense creeps?
    }

    getRooms() {
         return this.roomsInControl;
     }

    /**
     * Returns a list of available containers next to sources for Quarries
     *   Note: There could already be a Quarry creep walking to this container
     * @return {Array<StructureContainer>}
     */
    getAvailableQuarrySites() {
        if (this.availableQuarrySites == undefined) {
            let quarrySites = [];
            for (const roomName of this.roomsInControl) {
                let checkingRoom = Game.rooms[roomName];
                if (checkingRoom != undefined) {  // this check shouldn't be necessary
                    quarrySites = quarrySites.concat(checkingRoom.find(FIND_STRUCTURES,
                        {filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                                s.pos.lookFor(LOOK_CREEPS).length &&
                                s.pos.findInRange(FIND_SOURCES, 2).length > 0}));
                }
            }
            this.availableQuarrySites = quarrySites;
            return quarrySites;
        } else {
            return this.availableQuarrySites;
        }
    }

    /**
     * Builds extensive road networks
     * @param {*.RoomPosition} start anything with a .RoomPosition object
     * @param {*.RoomPosition} end anything with a .RoomPosition object
     * @param {Boolean} endWithContainer set true to build a container at the end
     */
    buildRoad(start, end, endWithContainer=false) {
        if (start == undefined || end == undefined) return;

        let pathObject = PathFinder.search(start.pos, {pos: end.pos, range: 1}, {
            swampCost: 1,
            roomCallback: this._matrixGenerator,
        });

        let length = pathObject.path.length - (endWithContainer ? 1 : 0);
        for (let p = 0; p < length; p++) {
            let pos = pathObject.path[p];
            Game.rooms[pos.roomName].createConstructionSite(pos, STRUCTURE_ROAD);
        }
        if (endWithContainer) {
            let pos = pathObject.path[pathObject.path.length - 1];
            Game.rooms[pos.roomName].createConstructionSite(pos, STRUCTURE_CONTAINER);
        }
    }

    /**
     * Sends a spawn order to an available spawner
     * @param {{String, {}=null} \An object containing a role and an optional memory object
     */
    _sendSpawnOrder(object) {
        if (object.role == undefined) {
            console.log("invalid spawn order revieced");
            return;
        }
        for (const spawn of this.spawns) {
            if (spawn.spawning == undefined) {
                if (object.memory != undefined)
                    return spawn.spawnRole2(object.role, object.memory);
                else
                    return spawn.spawnRole2(object.role);
            }
        }
    }

    // Check if we need to spawn quarries (adds to this.spawnQueue)
    _checkToSpawnQuarries() {
        for (const container of this.quarryContainers) {
            const item = {role: 'quarry',
                    memory: {role: 'quarry', working: false, home: this.mainRoomName, container: container.id}};
            let needQuarry = true;
            for (const quarryCreep of this.quarryCreeps) {
                if (quarryCreep.memory.container == container.id)
                    needQuarry = false;
            }
            if (!needQuarry) continue;
            for (const creep of this.spawnQueue) {
                if (creep.memory.container == container.id)
                    needQuarry = false;
            }
            for (const spawning of this.spawning) {
                if (spawning == item)
                    needQuarry = false;
            }
            if (needQuarry) {
                if (!this.spawnQueue.includes(item))
                    this.spawnQueue.push(item);
            }
        }
    }

    // Private function used for road mapping (see this.visualizeRoad())
    _matrixGenerator(roomName) {
        let costs = new PathFinder.CostMatrix();

        let room = Game.rooms[roomName];
        room.find(FIND_STRUCTURES).forEach(function(s) {
            // If structure is something you CAN'T walk over
            if (s.structureType !== STRUCTURE_CONTAINER &&
                !(s.structureType === STRUCTURE_RAMPART && s.my) &&
                (s.structureType !== STRUCTURE_ROAD))
                    costs.set(s.pos.x, s.pos.y, 255);
        });
        // Avoid already set construction sites if you can't walk over them
        room.find(FIND_CONSTRUCTION_SITES).forEach(function(cs) {
            if (cs.structureType !== STRUCTURE_ROAD &&
                !(cs.structureType === STRUCTURE_RAMPART && cs.my) &&
                cs.structureType !== STRUCTURE_CONTAINER)
                    costs.set(cs.pos.x, cs.pos.y, 255);
        });
        return costs;
    };

};

module.exports = Colony
