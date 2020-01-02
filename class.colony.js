var cb = require('controlBoard');

/**
 * Manages the object properties for an object at Memory.Colonies.Colony
 */
class Colony {
    constructor(mainRoomName) {
        this.mainRoomName = mainRoomName;
        this.neighborRooms = [];  // Rooms not in control but nearby
        this.roomsInControl = [];  // All rooms in control (including main)
        this.creepCount = {};

        // Energy collection
        this.quarryContainers = [];
        this.minerContainers = [];

        // Cluster management
        this.spawnQueue = [];
        this.spawning = [];
        this.spawns = [];

        // Cached variables
        this.allStructures = [];
        this.constructionSites = [];

        // ---------------- Initialization ---------------- //
        let neighbors = Game.rooms[mainRoomName].getNeighborRooms();
        for (const neighborRoomName of neighbors) {
            let room = Game.rooms[neighborRoomName];
            if (room != undefined && room.controller.reservation != undefined &&
                        room.controller.reservation.username === cb.USERNAME) {
                this.roomsInControl.push(neighborRoomName);
            } else {
                this.neighborRooms.push(neighborRoomName);
            }
        }
        this.roomsInControl.push(mainRoomName);

        // Construction sites that belong to this colony
        this.constructionSites = Object.values(Game.constructionSites).filter((cs) => this.roomsInControl.includes(cs.room.name));

        for (const role of cb.listOfRoles) {
            this.creepCount[role] = [];
        }
        for (const roomName of this.roomsInControl) {
            let checkingRoom = Game.rooms[roomName];
            //console.log("Checking room " + checkingRoom);
            if (checkingRoom != undefined) {
                // Doing creep count of entire colony //
                let creeps = checkingRoom.find(FIND_MY_CREEPS);
                for (const creep of creeps) {
                    this.creepCount[creep.memory.role].push(creep);

                    Game.creeps[creep.name].doRole();
                }

                // Count and organize all containers
                let containers = checkingRoom.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
                for (const c of containers) {
                    if (c.pos.findInRange(FIND_SOURCES, 1).length > 0)
                        this.quarryContainers.push(c);
                    else if (c.pos.findInRange(FIND_MY_STRUCTURES, 1,
                            {filter: (s) => s.structureType == STRUCTURE_EXTRACTOR}).length > 0)
                        this.minerContainers.push(c);
                }
            }
        }
        // Counting Spawns
        this.spawns = this.spawns.concat(Game.rooms[mainRoomName].find(FIND_MY_STRUCTURES,
                {filter: (s) => s.structureType == STRUCTURE_SPAWN}));
    }

    /**
     * Main loop more colony variable/memory management and decisions
     * (is split into 2 function mainRoomLoop() and targetRoomsLoop())
     */
    loop() {
        let mainRoom = Game.rooms[this.mainRoomName];
        if (mainRoom.storage != undefined)
            mainRoom.visual.text(mainRoom.storage.store[RESOURCE_ENERGY], mainRoom.storage.pos);

        this.checkIfNeedToSpawn();
    }

    /**
     * Checks if we need to spawn any creeps, and spawns them
     */
    checkIfNeedToSpawn() {
        // If there is no available spawn
        if (!this.spawns.filter((s) => s.spawning == undefined).length) return;

        // If there's at least 1 harvester, and less quarry creeps than quarry containers
        if (this.creepCount['harvester'].length && this.creepCount['quarry'].length < this.quarryContainers.length) {
            let containers = this.quarryContainers.map((c) => c.id);
            for (const quarryC of this.creepCount['quarry']) {
                let index = containers.indexOf(quarryC.memory.container);
                // Remove from list if a quarry has already claimed the container
                if (index >= 0) containers.splice(index, 1);
            }
            if (containers.length) {
                for (const container of containers) {
                    let object = {role: 'quarry', memory: {role: 'quarry', home: this.mainRoomName, working: false, container: container}};
                    // If spawn successful, don't send any more orders
                    if (this._sendSpawnOrder(object) == OK) return;
                }
            }
        }

        if (this.creepCount['harvester'].length < cb.minimumNumberOfHarvesters) {
            if (this._sendSpawnOrder({role: 'harvester'}) == OK) return;
        }
        if (this.creepCount['upgrader'].length < cb.minimumNumberOfUpgraders) {
            if (this._sendSpawnOrder({role: 'upgrader'}) == OK) return;
        }
        // claim room? spawn a pioneer here?
        if (this.creepCount['builder'].length < cb.minimumNumberOfBuilders) {
            if (this._sendSpawnOrder({role: 'builder'}) == OK) return;
        }
        if (this.creepCount['repairer'].length < this.roomsInControl.length) {
            let rooms = this.roomsInControl.concat([]);
            for (const repairer of this.creepCount['repairer']) {
                let index = rooms.indexOf(repairer.memory.target);
                if (index >= 0) rooms.splice(index, 1);
            }
            if (rooms.length) {
                let object = {role: 'repairer', memory: {role: 'repairer', home:this.mainRoomName, working: false, target: rooms[0]}};
                if(this._sendSpawnOrder(object) == OK) return;
            }
        }
        // Loop for spawning Reservers to each room
        for (const roomName of this.roomsInControl) {
            if (roomName == this.mainRoomName) continue;
            let room = Game.rooms[roomName];
            let hasReserver = false;
            for (const c of this.creepCount['reserver']) {
                // If there's already a reserver targetting this room, skip
                if (c.memory.target == roomName) hasReserver = true;
            }
            if (hasReserver) continue;

            if (room.controller.my == false &&
                (room.controller.reservation == undefined ||
                room.controller.reservation.ticksToEnd < 1000)) {
                    let object = {role: 'reserver', memory: {role: 'reserver', working: 'false', home: this.mainRoomName, target: roomName}};
                    if (this._sendSpawnOrder(object) == OK) return;
            }
        }
        // Make sure every neighboring room in control has at least cb.minimumNumberOfLongHarvesters
        if (this.creepCount['longHarvester'].length < cb.minimumNumberOfLongHarvesters * (this.roomsInControl.length - 1)) {
            for (const room of this.roomsInControl) {
                if (room == this.mainRoomName) continue;
                let targetedToRoom = this.creepCount['longHarvester'].filter((c) => c.memory.target == room).length;
                if (targetedToRoom < cb.minimumNumberOfLongHarvesters) {
                    let object = {role: 'longHarvester', memory: {role: 'longHarvester', home: this.mainRoomName, working: false, target: room}};
                    if (this._sendSpawnOrder(object) == OK) return;
                }
            }
        }
        if (Game.rooms[this.mainRoomName].storage != undefined && this.creepCount['logistic'].length < cb.minimumNumberOfLogistics) {
            if (this._sendSpawnOrder({role: 'logistic'}) == OK) return;
        }

        if (this.creepCount['miner'].length < this.minerContainers.length) {
            let containers = this.minerContainers.map((c) => c.id);
            for (const minerC of this.creepCount['miner']) {
                let index = containers.indexOf(minerC.memory.container);
                // Remove from list if a miner has already claimed the container
                if (index >= 0) containers.splice(index, 1);
            }
            if (containers.length) {
                for (const container of containers) {
                    let object = {role: 'miner', memory: {role: 'miner', home: this.mainRoomName, working: false, container: container}};
                    // If spawn successful, don't send any more orders
                    if (this._sendSpawnOrder(object) == OK) return;
                }
            }
        }
    }

    /**
     * Sends a spawn order to an available spawner
     * @param {Object{String, {}=null} \An object containing a role and an optional memory object
     * @return {Integer} see StructureSpawn.spawnCreep()
     */
    _sendSpawnOrder(object) {
        if (object.memory == undefined) object.memory = {role: object.role, working: false, home: this.mainRoomName};
        if (this._isBeingSpawned(object)) return ERR_BUSY;
        if (object.role == undefined) {
            console.log("invalid spawn order revieced");
            return ERR_INVALID_ARGS;
        }
        for (const spawn of this.spawns) {
            if (spawn.spawning == undefined) {
                return spawn.spawnRole2(object.role, object.memory);
            }
        }
        return ERR_BUSY;
    }

    /**
     * Sees if given role is already being spawned
     * @param {Object} object a spawn object containg role and memory
     * @return {Boolean} true if already spawning, false otherwise
     */
    _isBeingSpawned(object) {
        for (const spawn of this.spawns) {
            // If nothing is being spawned
            if (spawn.spawning == undefined) {
                delete spawn.memory.creepBeingSpawned;
            // Otherwise, check is creep being spawned is the same
            } else if (spawn.memory.creepBeingSpawned == object) {
                return true;
            }
        }
        return false;
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
     * Private function used for road mapping with PathFinder
     * @param {String} roomName name of room
     * @return {Object} returns a PathFinder.CostMatrix object
     */
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
