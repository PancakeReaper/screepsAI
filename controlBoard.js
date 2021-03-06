module.exports = {
    USERNAME: "PancakeReaper",
    // LongHarvester -> Harvester --v
    //               Repairer -> Builder -> Upgrader
    maxCreepCost: 1400,
    minimumNumberOfHarvesters: 2,
    minimumNumberOfUpgraders: 2,
    minimumNumberOfBuilders: 1,
    minimumNumberOfRepairers: 1,
    minimumNumberOfLogistics: 1,
    minimumNumberOfLongHarvesters: 2,
    // And then 2 (at most) quarries
    speakYourRole: false,

    // Update here and in prototype.creep.roles
    listOfRoles: ['harvester', 'upgrader', 'builder', 'repairer', 'pioneer', 'quarry', 'longHarvester',
                  'logistic', 'yoinkHarvester', 'attacker', 'attackerRanged', 'healer', 'miner', 'reserver'],

    harvesterBodyComposition: [WORK, CARRY, CARRY, MOVE, MOVE],
    harvesterShowPath: true,
    harvesterPathColour: '#55ff55',

    upgraderBodyComposition: [WORK, WORK, CARRY, MOVE],
    upgraderShowPath: true,
    upgraderPathColour: '#ffff55',

    builderBodyComposition: [WORK, CARRY, CARRY, MOVE, MOVE],
    builderShowPath: true,
    builderPathColor: '#ffffff',

    // Will also be shared with reinforcer //
    repairerBodyComposition: [WORK, CARRY, CARRY, CARRY, MOVE, MOVE],
    repairerShowPath: true,
    repairerPathColour: '#ff5555',
    repairWallsTo: 10000,

    logisticBodyComposition: [CARRY, CARRY, MOVE],
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

    reserverBodyComposition: [MOVE, CLAIM],

    attackerPathColour: '#000000',

    partCost: {'tough': 10, 'move': 50, 'carry': 50, 'attack': 80, 'work': 100, 'ranged_attack': 150, 'heal': 250, 'claim': 600},
    partOrder: {'tough': 1, 'claim':2, 'work': 2, 'ranged_attack':3, 'attack':4, 'heal':5, 'carry':6, 'move':7},

    buildingPlans: {
        2: {"extension": 5},
        3: {"extension": 5, "tower": 1},
        4: {"extension": 10, "storage": 1},
        5: {"extension": 10, "tower": 1}, // 2 links
        6: {"extension": 10, "extractor": 1, "terminal": 1}, // 1 link, 3 labs
        7: {"extension": 10, "tower": 1}, // 1 link, 3 labs
        8: {"extension": 10, "tower": 3}, // 2 links, 4 labs, observer, power spawn
    },
};
