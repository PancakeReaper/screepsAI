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
    // Check if creep is in the home room AND doesn't have a target room before doing their role //
    } else if (this.room.name != this.memory.home && this.memory.target == undefined) {
        const exit = this.room.findExitTo(this.memory.home);
        this.moveTo(this.pos.findClosestByPath(exit));
    // Check if creep has a target room AND is not working AND is in target room before doing their role //
    //} else if (this.memory.target != undefined && this.room.name != this.memory.target) {
    //    let exit = this.room.findExitTo(this.memory.target);
    //    this.moveTo(this.pos.findClosestByPath(exit));
    // Creep doesn't have a forceMove issue and is in the right room, proceed with role tasks
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

    if (this.memory.working && this.carry.energy == 0) {
        this.memory.working = false;
    } else if (!this.memory.working && this.carry.energy >= this.carryCapacity) {
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
    return this.moveTo(target);
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
    if (this.checkIfCarryingGO() || this.checkForDroppedResources())
        return;

    if (fromContainer) {
        const container = this.pos.findClosestByPath(FIND_STRUCTURES,
            {filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                            s.store[RESOURCE_ENERGY] > this.carryCapacity - _.sum(this.carry)});
        if (container != undefined) {
            if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.signaledMove(container);
            }
            return;
        }
    }
    if (fromStorage) {
        if (this.room.storage != undefined && this.room.storage.store[RESOURCE_ENERGY] > this.carryCapacity) {
            if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.signaledMove(this.room.storage);
            }
            return;
        }
    }
    if (fromSource) {
        const energy_source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE,
            (s) => s.room.name == this.room.name);

        if (energy_source != undefined) {
            if (this.harvest(energy_source) == ERR_NOT_IN_RANGE) {
                this.signaledMove(energy_source);
            }
            return;
        }
    }
};

/**
 * Checks if there are dropped resources or tombstone within a 25 range
 *   from creep, if so then gather the dropped resource
 * @returns {Boolean} true if a dropped resource or tombstone has been found
 */
Creep.prototype.checkForDroppedResources = function() {
    const droppedEnergy = this.pos.findInRange(FIND_DROPPED_RESOURCES, 20);
    if (droppedEnergy != undefined && droppedEnergy.length > 0 &&
            droppedEnergy.amount <= _.sum(this.carry) - this.carry) {
        if (this.pickup(droppedEnergy[0]) == ERR_NOT_IN_RANGE) {
            this.signaledMove(droppedEnergy[0]);
        }
        return true;
    }
    const tombstones = this.pos.findInRange(FIND_TOMBSTONES, 20);
    if (tombstones != undefined && tombstones.length > 0 && tombstones[0].store[RESOURCE_ENERGY] > 0) {
        if (this.withdraw(tombstones[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.signaledMove(tombstones[0]);
        }
        return true;
    }
    return false;
};

/**
 * Assings a RoomPosition object to the creep's forceMove memory,
 *   forcing the creep to move to that location
 * @param {number} x X position to move to
 * @param {number} y Y position to move to
 */
Creep.prototype.forceMove = function(x, y) {
    this.memory.forceMove = new RoomPosition(x, y, "W34N1");
};

/**
 * Checks if creep is carrying Ghodium Oxide resource,
 *   if so then immediately store the resource into storage
 * @returns {Boolean} true if carrying Ghodium Oxide, false otherwise
 */
Creep.prototype.checkIfCarryingGO = function() {
    if (this.carry[RESOURCE_GHODIUM_OXIDE] != undefined) {
        if (this.transfer(this.room.storage, RESOURCE_GHODIUM_OXIDE) == ERR_NOT_IN_RANGE) {
            this.signaledMove(this.room.storage);
            return true;
        }
    }
    return false;
};
