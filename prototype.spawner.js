var cb = require("controlBoard");

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
            if (this.room.energyAvailable >= cb.poneerBodyCost) {
                this.spawnCreep(cb.pioneerBody, String(Game.time),
                    {memory: {role: 'pioneer', target: this.memory.claimRoom, home: this.room.name}});
                delete this.memory.claimRoom;
            }

        } else if (numberOfCreeps.builder < cb.minimumNumberOfBuilders) {
            this.spawnRole('builder', this.room.name);

        } else if (numberOfCreeps.repairer < cb.minimumNumberOfRepairers) {
            this.spawnRole('repairer', this.room.name);

        } else if (this.memory.target != undefined && numberOfCreeps.longHarvester < cb.minimumNumberOfLongHarvesters) {
            this.spawnRole('longHarvester', this.room.name, this.memory.target);

        // Will only spawn a logistic if there is a Storage structure in the room
        } else if (this.room.storage != undefined && numberOfCreeps.logistic < cb.minimumNumberOfLogistics) {
            //this.spawnCreep(cb.logisticBody, 'logistic' + String(Game.time),
            //    {memory: {role: 'logistic', working: false, home: this.room.name}});
            this.spawnRole('logistic', this.room.name);

        } else if (extractor.length > 0 && numberOfCreeps.miner < 1 && extractor[0].pos.lookFor(LOOK_MINERALS)[0].mineralAmount > 0) {
            this.spawnRole('miner', this.room.name);

        } else if (this.memory.target != undefined && Game.rooms[this.memory.target] != undefined &&
                Game.rooms[this.memory.target].controller.my == false &&
                (Game.rooms[this.memory.target].controller.reservation == undefined ||
                Game.rooms[this.memory.target].controller.reservation.ticksToEnd < 300) &&
                numberOfCreeps.reserver < 1) {
            this.spawnRole('reserver', this.room.name, this.memory.target);
        }
    }
};

/**
 * Spawns a creep using the minimum of all resources available or cb.maxCreepCost
 * @param {string} role The name of one of the available roles for a creep
 * @param {string} home The name of the room for the creep to operate in
 */
StructureSpawn.prototype.spawnRole = function(role, home, target=undefined) {
    const bodyComp = cb[role + "BodyComposition"];
    if (bodyComp != undefined) {  // Checks if role doesn't have a FIXED body comp
        let cost = 0;
        for (let part of bodyComp) {
            cost = cost + cb.partCost[part];
        }
        let body = [];
        const numOfComps = Math.min(Math.floor(this.room.energyAvailable/cost), Math.floor(cb.maxCreepCost/cost));
        for (let i = 0; i < numOfComps; i++) {
            body = body.concat(bodyComp);
        }
        if (role == 'quarry' && this.room.energyAvailable >= 650)  // 650 is hard coded cost for quarry
            body = body.concat([MOVE, MOVE]);

        body.sort( (a, b) => cb.partOrder[a] > cb.partOrder[b]);
        if (target != undefined)
            this.spawnCreep(body, role + String(Game.time),
                    {memory: {role: role, working: false, home: home, target: target}});
        else
            this.spawnCreep(body, role + String(Game.time),
                    {memory: {role: role, working: false, home: home}});

    } else {
        console.log("Body composition not specified for role " + role);
        if (target != undefined)
            this.spawnCreep(cb[role + "Body"], role + String(Game.time),
                    {memory: {role: role, working: false, home: home, target: target}});
        else
            this.spawnCreep(cb[role + "Body"], role + String(Game.time),
                    {memory: {role: role, working: false, home: home}});
    }
};
StructureSpawn.prototype.spawnRole2 = function(role, memory=undefined) {
    let memoryPart;
    if (memory != undefined) {
        memoryPart = memory;
    } else {
        memoryPart = {role: role, working: false, home: this.room.name};
    }

    const bodyComp = cb[role + "BodyComposition"];
    if (bodyComp != undefined) {  // Checks if role doesn't have a FIXED body comp
        let cost = 0;
        for (let part of bodyComp) {
            cost = cost + cb.partCost[part];
        }
        let body = [];
        const numOfComps = Math.min(Math.floor(this.room.energyAvailable/cost), Math.floor(cb.maxCreepCost/cost));
        for (let i = 0; i < numOfComps; i++) {
            body = body.concat(bodyComp);
        }

        body.sort( (a, b) => cb.partOrder[a] > cb.partOrder[b]);
        this.spawnCreep(body, role + String(Game.time), {memory: memoryPart})
    } else {
        let body = cb[role + "Body"];
        if (role == 'quarry' && this.spawnCreep(body.concat([MOVE,MOVE]), "dryrun", {dryRun: true}) == OK)
            body = body.concat([MOVE, MOVE]);
        this.spawnCreep(body, role + String(Game.time),
                {memory: memoryPart});
    }
}

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
    const bodyComp = cb.yoinkHarvesterBodyComposition;
    let cost = 0;
    for (let part of bodyComp) {
        cost = cost + cb.partCost[part];
    }
    let body = [];
    const numOfComps = Math.min(Math.floor(this.room.energyAvailable/cost), Math.floor(cb.maxCreepCost/cost));
    for (let i = 0; i < numOfComps; i++) {
        body = body.concat(bodyComp);
    }

    body.sort( (a, b) => cb.partOrder[a] > cb.partOrder[b]);
    return this.spawnCreep(body, String(Game.time),
        {memory: {role: 'yoinkHarvester', working: false, home: this.room.name, target: target}});
};

/**
 * Creates an attacker creep which attacks any hostile creeps in target room
 * @param {string} target A room name from which to attack creeps in
 */
StructureSpawn.prototype.spawnAttacker = function(target) {
    return this.spawnCreep( [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], "attacker" + String(Game.time),
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
