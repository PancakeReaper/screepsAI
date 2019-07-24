var cb = require("controlBoard");

//var numberOfCreeps = {};
//var population;

/**
 * Updates the numberOfCreeps and population variables
 *   // TODO: Move away from this and store a numberOfCreeps map in memory
 */
 /*
StructureSpawn.prototype.update = function() {
    let creeps = _.values(Game.creeps);
    creeps = _.filter(creeps, (c) => c.memory.home == this.room.name);

    // Takes listOfRoles.length * creeps.length to compute but meh
    for (const role of cb.listOfRoles) {
        numberOfCreeps[role] = _.sum(creeps, (c) => c.memory.role == role);
    }
    population = creeps.length;
};
*/

/**
 * Selects a target for longHarvesters and pioneers
 * @param {string} newTarget A room name (Ex, "W34N1")
 */
StructureSpawn.prototype.setTarget = function(newTarget) {
    this.memory.target = newTarget;
};

/**
 * Decides whether or not to spawn a creep, if so then what kind of creep
 */
StructureSpawn.prototype.spawnIfNeeded = function() {
    let numberOfCreeps = Memory.creepCount[this.room.name];
    let population = _.sum(_.values(numberOfCreeps));
    if (population < cb.MAX_POPULATION + cb.POPULATION_OVERFLOW) {

        const extractor = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTRACTOR});
        // If there is at least 1 harvester and 1 container in the room then spawn Quarries
        const container = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
//        console.log(this.room.name + ": \'" + Boolean(container.length) + "\'");
        if (numberOfCreeps.harvester > 0 && container.length && numberOfCreeps.quarry < this.room.find(FIND_SOURCES).length) {
            this.spawnCreep(cb.quarryBody, 'quarry' + String(Game.time), {memory: {role: 'quarry', home: this.room.name}});

        } else
        if (numberOfCreeps.harvester < cb.minimumNumberOfHarvesters) {
            this.spawnRole('harvester', this.room.name);

        } else if (numberOfCreeps.upgrader < cb.minimumNumberOfUpgraders) {
            this.spawnRole('upgrader', this.room.name);

        } else if (this.memory.claimRoom != undefined) {
            if (this.energyAvailable >= cb.poneerBodyCost) {
                this.spawnCreep(cb.pioneerBody, String(Game.time),
                    {memory: {role: 'pioneer', target: this.memory.claimRoom, home: this.room.name}});
                delete this.memory.claimRoom;
            }

        } else if (numberOfCreeps.builder < cb.minimumNumberOfBuilders) {
            this.spawnRole('builder', this.room.name);

        } else if (numberOfCreeps.repairer < cb.minimumNumberOfRepairers) {
            this.spawnRole('repairer', this.room.name);

        } else if (this.memory.target != undefined && numberOfCreeps.longHarvester < cb.minimumNumberOfLongHarvesters) {
            this.spawnRole('longHarvester', this.room.name);

        // Will only spawn a logistic if there is a Storage structure in the room
        } else if (this.room.storage != undefined && numberOfCreeps.logistic < cb.minimumNumberOfLogistics) {
            this.spawnCreep(cb.logisticBody, 'logistic' + String(Game.time),
                {memory: {role: 'logistic', working: false, home: this.room.name}});
            //this.spawnRole('logistic');

        } else if (extractor.length > 0 && numberOfCreeps.miner < 1 && extractor[0].pos.lookFor(LOOK_MINERALS)[0].mineralAmount > 0) {
            this.spawnRole('miner', this.room.name);

        } else if (this.memory.target != undefined && Game.rooms[this.memory.target] != undefined &&
                Game.rooms[this.memory.target].controller.my == false &&
                (Game.rooms[this.memory.target].controller.reservation == undefined ||
                Game.rooms[this.memory.target].controller.reservation.ticksToEnd < 100) &&
                numberOfCreeps.reserver < 1) {
            this.spawnCreep(cb.reserverBody, 'reserver' + String(Game.time),
                {memory: {role: 'reserver', home: this.room.name, target: this.memory.target}});
        }
    }
};

/**
 * Spawns a creep using the minimum of all resources available or cb.maxCreepCost
 * @param {string} role The name of one of the available roles for a creep
 * @param {string} home The name of the room for the creep to operate in
 */
StructureSpawn.prototype.spawnRole = function(role, home) {
    const bodyComp = cb[role + "BodyComposition"];
    let body = [];
    if (bodyComp != undefined) {  // Checks if role doesn't have a FIXED body comp
        let cost = 0;
        for (let part of bodyComp) {
            cost = cost + cb.partCost[part];
        }
        const numOfComps = Math.min(Math.floor(this.room.energyAvailable/cost), Math.floor(cb.maxCreepCost/cost));
//        const numOfComps = Math.floor(this.room.energyAvailable/cost);
        for (let i = 0; i < numOfComps; i++) {
            body = body.concat(bodyComp);
        }

        // If the role does NOT need to specify a target in memory
        if (role != 'longHarvester' && role != 'pioneer' && role != 'yoinkHarvester') {
            this.spawnCreep(body, role + String(Game.time), {memory: {role: role, working: false, home: home}});
        } else if (role == 'yoinkHarvester') {
            this.spawnCreep(cb.yoinkHarvesterBody, role + String(Game.time),
                {memory: {role: 'yoinkHarvester', working: false, home: home, target: cb.yoinkHarvesterTarget}});
        } else if (this.memory.target != undefined) {
            this.spawnCreep(body, role + String(Game.time), {memory:
                {role: role, working: false, home: home, target: this.memory.target}});
        } else {
            console.log("Tried to make a targeted creep without a target specified! [prototype.spawner.js ln79]");
        }
    //} else if (role == 'quarry'){
        //
    } else {
        console.log("Body composition not specified for role " + role);
    }
};

/**
 * Creates an pioneer creep which moves to target room and attempts to claim it
 * @param {string} target A room name from which to attack creeps in
 */
StructureSpawn.prototype.spawnPioneer = function(target) {
    return this.spawnCreep( [WORK, CARRY, CARRY, CLAIM, MOVE, MOVE, MOVE, MOVE], "pioneer" + String(Game.time),
        {memory: {role: 'pioneer', working: false, home: this.room.name, target: target}});
};

/**
 * Creates a yoinkHarvester creep which steals energy from a target room
 * @param {string} target A room name from which to steal energy from
 */
StructureSpawn.prototype.spawnYoinkHarvester = function(target) {
    return this.spawnCreep(cb.yoinkHarvesterBody, String(Game.time),
        {memory: {role: 'yoinkHarvester', working: false, home: this.room.name, target: target}});
};

/**
 * Creates an attacker creep which attacks any hostile creeps in target room
 * @param {string} target A room name from which to attack creeps in
 */
StructureSpawn.prototype.spawnAttacker = function(target) {
    return this.spawnCreep( [TOUGH, MOVE, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], "attacker" + String(Game.time),
        {memory: {role: 'attacker', home: this.room.name, target: target}});
};

/**
 * Creates an attacker creep which attacks any hostile creeps in target room
 * @param {string} target A room name from which to attack creeps in
 */
StructureSpawn.prototype.spawnAttackerRanged = function(target) {
    return this.spawnCreep( [MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK], "attackerR" + String(Game.time),
        {memory: {role: 'attackerRanged', home: this.room.name, target: target}});
};

/**
 * Creates an attacker creep which attacks any hostile creeps in target room
 * @param {string} target A room name from which to attack creeps in
 */
StructureSpawn.prototype.spawnHealer = function(target) {
    return this.spawnCreep( [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL], "healer" + String(Game.time),
        {memory: {role: 'healer', home: this.room.name, target: target}});
};

/**
 * Prints to the console a summary of the # of creeps belonging to this spawner
 *   // TODO: Rewrite such that it loops through Game.creeps instead
 */
StructureSpawn.prototype.analysis = function() {
    let numberOfCreeps = Memory.creepCount[this.room.name];
    let population = _.sum(_.values(numberOfCreeps));
    console.log("Analysis of " + this.name + " located in room " + this.room.name + ":");
    console.log("\tColony population: " + population);
    for (const role of _.keys(numberOfCreeps)) {
        if (role == 'pioneer' || role == 'attacker' || role == 'attackerRanged')
            continue;
        console.log("\t\t[" + role + "]: " + numberOfCreeps[role]);
    }
};
