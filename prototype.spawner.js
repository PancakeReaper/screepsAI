var cb = require("controlBoard");

var numberOfCreeps = {};
var population;

/**
 * Updates the numberOfCreeps and population variables
 *   // TODO: Move away from this and store a numberOfCreeps map in memory
 */
StructureSpawn.prototype.update = function() {
    let creeps = _.values(Game.creeps);
    creeps = _.filter(creeps, (c) => c.memory.home == this.room.name);

    // Takes listOfRoles.length * creeps.length to compute but meh
    for (const role of cb.listOfRoles) {
        numberOfCreeps[role] = _.sum(creeps, (c) => c.memory.role == role);
    }
    population = creeps.length;
};

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
    if (population < cb.MAX_POPULATION + cb.POPULATION_OVERFLOW) {

        // If there is at least 1 harvester and 1 container in the room then spawn Quarries
        const container = this.room.find(FIND_STRUCTURES, (s) => s.structureType == STRUCTURE_CONTAINER);
        if (numberOfCreeps.harvester > 0 && container != undefined && numberOfCreeps.quarry < this.room.find(FIND_SOURCES).length) {
            this.spawnCreep(cb.quarryBody, 'quarry' + String(Game.time), {memory: {role: 'quarry', home: this.room.name}});

        } else if (numberOfCreeps.harvester < cb.minimumNumberOfHarvesters) {
            this.spawnRole('harvester');

        } else if (numberOfCreeps.upgrader < cb.minimumNumberOfUpgraders) {
            this.spawnRole('upgrader');

        } else if (this.memory.claimRoom != undefined) {
            if (this.energyAvailable >= cb.poneerBodyCost) {
                this.spawnCreep(cb.pioneerBody, String(Game.time),
                    {memory: {role: 'pioneer', target: this.memory.claimRoom, home: this.room.name}});
                delete this.memory.claimRoom;
            }

        } else if (numberOfCreeps.repairer < cb.minimumNumberOfRepairers) {
            this.spawnRole('repairer');

        } else if (numberOfCreeps.builder < cb.minimumNumberOfBuilders) {
            this.spawnRole('builder');

        } else if (numberOfCreeps.longHarvester < cb.minimumNumberOfLongHarvesters) {
            this.spawnRole('longHarvester');

        // Will only spawn a logistic if there is a Storage structure in the room
        } else if (this.room.storage != undefined && numberOfCreeps.logistic < cb.minimumNumberOfLogistics) {
            this.spawnCreep(cb.logisticBody, 'logistic' + String(Game.time),
                {memory: {role: 'logistic', working: false, home: this.room.name}});
            //this.spawnRole('logistic');
        }
    }
};

/**
 * Spawns a creep using the minimum of all resources available or cb.maxCreepCost
 * @param {string} role The name of one of the available roles for a creep
 */
StructureSpawn.prototype.spawnRole = function(role) {
    const bodyComp = cb[role + "BodyComposition"];
    let body = [];
    if (bodyComp != undefined) {  // Checks if role doesn't have a FIXED body comp
        let cost = 0;
        for (let part of bodyComp) {
            cost = cost + cb.partCost[part];
        }
        const numOfComps = Math.min(Math.floor(this.room.energyAvailable/cost), Math.floor(cb.maxCreepCost/cost));
        for (let i = 0; i < numOfComps; i++) {
            body = body.concat(bodyComp);
        }

        // If the role does NOT need to specify a target in memory
        if (role != 'longHarvester' && role != 'pioneer' && role != 'yoinkHarvester') {
            this.spawnCreep(body, role + String(Game.time), {memory: {role: role, working: false, home: this.room.name}});
        } else if (role == 'yoinkHarvester') {
            this.spawnCreep(cb.yoinkHarvesterBody, role + String(Game.time),
                {memory: {role: 'yoinkHarvester', working: false, home: this.room.name, target: cb.yoinkHarvesterTarget}});
        } else if (this.memory.target != undefined) {
            this.spawnCreep(body, role + String(Game.time), {memory:
                {role: role, working: false, home: this.room.name, target: this.memory.target}});
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
    return this.spawnCreep( [ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE], "attacker",
        {memory: {role: 'attacker', home:this.room.name, target: target}});
};

/**
 * Prints to the console a summary of the # of creeps belonging to this spawner
 *   // TODO: Rewrite such that it loops through Game.creeps instead
 */
StructureSpawn.prototype.analysis = function() {
    console.log("Analysis of " + this.name + " located in room " + this.room.name + ":");
    console.log("\tColony population: " + population);
    for (const role of cb.listOfRoles) {
        if (role == 'pioneer' || role == 'attacker')
            continue;
        console.log("\t\t[" + role + "]: " + numberOfCreeps[role] +
            " ( ~" + Math.round(numberOfCreeps[role]/population*10000.0) / 100 + "% )");
    }
};
