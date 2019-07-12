module.exports = {
    MAX_POPULATION: 10,
    // Permitted overflow if needed to meet minimum role numbers
    POPULATION_OVERFLOW: 3, // Typically keep at 2 for quarries
    //  Harvester --v
    // Repairer -> Builder -> Upgrader
    //          LongHarvester -^
    maxCreepCost: 1200,
    minimumNumberOfHarvesters: 2,
    minimumNumberOfUpgraders: 2,
    minimumNumberOfBuilders: 2,
    minimumNumberOfRepairers: 1,
    minimumNumberOfLogistics: 1,
    minimumNumberOfLongHarvesters: 2,
    // And then 2 (at most) quarries
    speakYourRole: false,

    // Update here and in prototype.creep.roles
    listOfRoles: ['harvester', 'upgrader', 'builder', 'repairer', 'pioneer', 'quarry', 'longHarvester',
                  'logistic', 'yoinkHarvester', 'attacker'],

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
    repairWallsTo: 24000,

    logisticBody: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],

    yoinkHarvesterBodyComposition: [CARRY, MOVE],
    yoinkHarvesterPathColour: '#55ffff',

    pioneerBody: [CLAIM, MOVE],

    quarryBody: [WORK, WORK, WORK, WORK, WORK, MOVE],

    longHarvesterBodyComposition: [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    longHarvesterShowPath: false,
    longHarvesterPathColour: '#ff55ff',

    attackerPathColour: '#000000',

    partCost: {'move': 50, 'work': 100, 'carry': 50, 'attack': 80, 'ranged_attack': 150, 'heal': 250, 'claim': 600, 'tough': 10},
};
