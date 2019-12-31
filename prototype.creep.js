var cb = require("controlBoard");

var roles = {
    harvester: require("role.harvester"),
    upgrader: require("role.upgrader"),
    builder: require("role.builder"),
    repairer: require("role.repairer"),
    quarry: require("role.quarry"),
    longHarvester: require("role.longHarvester"),
    logistic: require("role.logistic"),
    yoinkHarvester: require("role.yoinkHarvester"),
    attacker: require("role.attacker"),
    attackerRanged: require("role.attackerRanged"),
    pioneer: require("role.pioneer"),
    healer: require("role.healer"),
    miner: require("role.miner"),
    reserver: require("role.reserver"),
};

/**
 * Checks if creep has a forceMove issued, if so excecutes the forceMove
 *   otherwise check if creep if in the right room for operations,
 *   if so then excecutes role.
 */
Creep.prototype.doRole = function() {
    // Check if creep has a forceMove has been issued //
    if (this.memory.forceMove != undefined) {
        this.room.visual.text("Force moving", this.pos, {color: 'white'});
        this.moveTo(this.memory.forceMove.x, this.memory.forceMove.y);
        if (this.pos.isEqualTo(this.memory.forceMove.x, this.memory.forceMove.y))
            delete this.memory.forceMove;

    // Make sure creep is in home room before doing role //
    } else if (this.room.name != this.memory.home && this.memory.target == undefined) {
        const exit = this.room.findExitTo(this.memory.home);
        this.moveTo(this.pos.findClosestByPath(exit));

    // Creep doesn't have a forceMove issue and is in the right room, proceed with role tasks //
    } else {
        const role = roles[this.memory.role];
        if (role != undefined)
            role.run(this);
        else
            this.say("Invalid role");
    }
};

/**
 * Updates various memory variables for each creep
 */
Creep.prototype.update = function() {
    if (cb.speakYourRole) this.room.visual.text(this.ticksToLive, this.pos, {color: cb[this.memory.role + "PathColour"]});

    if (this.memory.working && _.sum(this.store) == 0) {
        this.memory.working = false;
    } else if (!this.memory.working && _.sum(this.store) >= this.store.getCapacity()) {
        this.memory.working = true;
    }
};

/**
 * A wrapper for the creep.moveTo() function to draw where the creep is going
 * @param {RoomPosition | *.RoomPosition} target
 */
Creep.prototype.signaledMove = function(target) {
    if (cb[this.memory.role + "ShowPath"] != undefined && cb[this.memory.role + "ShowPath"]) {
        this.room.visual.line(this.pos, target.pos, {color: cb[this.memory.role + "PathColour"]});
    }
    return this.moveTo(target, {reusePath: 5});
};

/**
 * Makes the creep move away from the target
 * @param {RoomPosition | *.RoomPosition} target
 * @return {number} see Creep.moveTo();
 */
Creep.prototype.moveAway = function(target) {
    // Calulate the opposite direction from target
    let direction = this.pos.getDirectionTo(target);
    direction = direction == 4 ? 8 : (direction + 4) % 8;
    return this.move(direction);
};

/**
 * Attempts to get Energy with the following priority:
 *     Dropped Energy -> Tombstones -> Containers -> Storage -> Sources
 * @param {Boolean} fromContainer Is allowed to collect energy from containers?
 * @param {Boolean} fromSource Is allowed to collect energy from Sources?
 * @param {Boolean} fromStorage Is allowed to collect energy from the room's Storage?
 */
Creep.prototype.getEnergy = function(fromContainer, fromSource, fromStorage) {
    // Both these check function will return true if found
    if (this.checkIfCarryingMinerals() || this.checkForDroppedResources(20, false))
        return;

    if (this.memory.source == undefined) {
        // Set memory.source to a active source if available
        if (fromSource) {
            const source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source != undefined)
                this.memory.source = source.id;
        }
        // Rewrite memory.source to storage if available
        if (fromStorage) {
            const terminal = this.room.terminal;
            if (terminal != undefined && terminal.store[RESOURCE_ENERGY] > this.store.getFreeCapacity()) {
                this.memory.source = terminal.id;
            }
            const storage = this.room.storage;
            if (storage != undefined && storage.store[RESOURCE_ENERGY] > this.store.getFreeCapacity()) {
                this.memory.source = storage.id;
            }
        }
        // Rewrite memory.source to a contianer if available
        if (fromContainer) {
            const container = this.pos.findClosestByPath(FIND_STRUCTURES,
                {filter: (c) => c.structureType == STRUCTURE_CONTAINER &&
                                c.store[RESOURCE_ENERGY] > this.store.getFreeCapacity()});
            if (container != undefined)
                this.memory.source = container.id;
        }
    }
    // If a valid energy source is available go to it
    if (this.memory.source != undefined) {
        const source = Game.getObjectById(this.memory.source);
        if (source != undefined && source.structureType != undefined) {
            if (this.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                this.signaledMove(source);
            else
                delete this.memory.source;
        } else {
            if (this.harvest(source) == ERR_NOT_IN_RANGE)
                this.signaledMove(source);
            else
                delete this.memory.source;
        }
    }
};

/**
 * Checks if there are dropped resources or tombstone within a 20 range
 *   from creep, if so then gather the dropped resource
 * @param {Number} range Specify the range to look for dropped resources
 * @param {Boolean} pickupMinerals Whether or not to pick up minerals from tombstone
 * @returns {Boolean} true if a dropped resource or tombstone has been found
 */
Creep.prototype.checkForDroppedResources = function(range, pickupMinerals) {
    let droppedEnergy = this.pos.findInRange(FIND_DROPPED_RESOURCES, range);
    if (!pickupMinerals)
        droppedEnergy = _.filter(droppedEnergy, (i) => i.resourceType == RESOURCE_ENERGY);
    if (droppedEnergy != undefined && droppedEnergy.length > 0) {
        if (this.pickup(droppedEnergy[0]) == ERR_NOT_IN_RANGE) {
            this.signaledMove(droppedEnergy[0]);
        }
        return true;
    }

    let tombstones;
    if (!pickupMinerals) {
        tombstones = this.pos.findInRange(FIND_TOMBSTONES, range, {filter:
            (t) => t.store[RESOURCE_ENERGY] > 0});
        if (tombstones != undefined && tombstones.length > 0) {
            if (this.withdraw(tombstones[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.signaledMove(tombstones[0]);
            }
            return true;
        }
        return false;
    } else {
        tombstones = this.pos.findInRange(FIND_TOMBSTONES, range, {filter:
            (t) => _.sum(t.store) > 0});
        if (tombstones != undefined && tombstones.length > 0) {
            for (const resourceType in tombstones[0].store) {
                if (this.withdraw(tombstones[0], resourceType) == ERR_NOT_IN_RANGE) {
                    this.signaledMove(tombstones[0]);
                }
            }
            return true;
        }
        return false;
    }
};

/**
 * Checks if creep is carrying Ghodium Oxide resource,
 *   if so then immediately store the resource into storage
 * @returns {Boolean} true if carrying Ghodium Oxide, false otherwise
 */
Creep.prototype.checkIfCarryingMinerals = function() {
        // Tranfer all to storage
    for (const resourceType in this.store) {
        if (resourceType != RESOURCE_ENERGY) {
            if (this.room.terminal != undefined) {
                if (this.transfer(this.room.terminal, resourceType) == ERR_NOT_IN_RANGE) {
                    this.signaledMove(this.room.terminal);
                }
                return true;
            } else if (this.room.storage != undefined) {
                if (this.transfer(this.room.storage, resourceType) == ERR_NOT_IN_RANGE) {
                    this.signaledMove(this.room.storage);
                }
                return true;
            } else {
                return false;
            }
        }
    }
    return false;
};

/**
 * Assings a RoomPosition object to the creep's forceMove memory,
 *   forcing the creep to move to that location
 * @param {number} x X position to move to
 * @param {number} y Y position to move to
 */
Creep.prototype.forceMove = function(x, y, room=this.room.name) {
    this.memory.forceMove = new RoomPosition(x, y, room);
};
