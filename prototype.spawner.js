var cb = require("controlBoard");

/**
 * Selects a target for longHarvesters and pioneers
 * @param {string} newTarget A room name (Ex, "W34N1")
 */
StructureSpawn.prototype.setTarget = function(newTarget) {
    this.memory.target = newTarget;
};

/**
 * Spawns a role using the minimum of all resources available or cb.maxCreepCost
 * @param {string} role The name of one of the available roles for a creep
 * @param {Object} memory An optional predefined memory for more complex roles
 */
StructureSpawn.prototype.spawnRole2 = function(role, memory=undefined) {
    let memoryPart;
    if (memory != undefined) {
        memoryPart = memory;
    } else {
        memoryPart = {role: role, working: false, home: this.room.name};
    }
    this.memory.creepBeingSpawned = {role: role, memory: memoryPart};

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
        return this.spawnCreep(body, role + String(Game.time), {memory: memoryPart})
    } else {
        let body = cb[role + "Body"];
        if (role == 'quarry' && this.spawnCreep(body.concat([MOVE,MOVE]), "dryrun", {dryRun: true}) == OK)
            body = body.concat([MOVE, MOVE]);
        return this.spawnCreep(body, role + String(Game.time),
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
