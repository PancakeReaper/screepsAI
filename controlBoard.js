module.exports = {
//Game.spawns.Spawn1.spawnCreep( [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY,  CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'harvester' + String(Game.time), {memory: {role: 'harvester', working: false, home: "W35N3"}});
    MAX_POPULATION: 10,
    // Permitted overflow if needed to meet minimum role numbers
    POPULATION_OVERFLOW: 3, // Typically keep at 2 for quarries
    // LongHarvester -> Harvester --v
    //               Repairer -> Builder -> Upgrader
    maxCreepCost: 1400,
    minimumNumberOfHarvesters: 2,
    minimumNumberOfUpgraders: 1,
    minimumNumberOfBuilders: 1,
    minimumNumberOfRepairers: 1,
    minimumNumberOfLogistics: 1,
    minimumNumberOfLongHarvesters: 2,
    // And then 2 (at most) quarries
    speakYourRole: false,

    // Update here and in prototype.creep.roles
    listOfRoles: ['harvester', 'upgrader', 'builder', 'repairer', 'pioneer', 'quarry', 'longHarvester',
                  'logistic', 'yoinkHarvester', 'attacker', 'attackerRanged', 'healer', 'miner'],

    harvesterBodyComposition: [WORK, CARRY, CARRY, MOVE, MOVE],
    harvesterShowPath: true,
    harvesterPathColour: '#55ff55',

    upgraderBodyComposition: [WORK, CARRY, MOVE],
    upgraderShowPath: true,
    upgraderPathColour: '#ffff55',

    builderBodyComposition: [WORK, CARRY, CARRY, MOVE, MOVE],
    builderShowPath: true,
    builderPathColor: '#ffffff',

    // Will also be shared with reinforcer //
    repairerBodyComposition: [WORK, CARRY, CARRY, CARRY, MOVE, MOVE],
    repairerShowPath: true,
    repairerPathColour: '#ff5555',
    repairWallsTo: 30000,

    logisticBody: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
    logisticShowPath: true,
    logisticPathColour: '#55ffff',

    yoinkHarvesterBodyComposition: [CARRY, MOVE],
    yoinkHarvesterPathColour: '#55ffff',

    pioneerBody: [CLAIM, MOVE],
    pioneerPathColour: '#55ffff',

    quarryBody: [WORK, WORK, WORK, WORK, WORK, MOVE],

    longHarvesterBodyComposition: [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    longHarvesterShowPath: true,
    longHarvesterPathColour: '#ff55ff',

    minerBodyComposition: [WORK, CARRY, MOVE],

    attackerPathColour: '#000000',

    partCost: {'tough': 10, 'move': 50, 'carry': 50, 'attack': 80, 'work': 100, 'ranged_attack': 150, 'heal': 250, 'claim': 600},
};
