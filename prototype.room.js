var cb = require("controlBoard");

var matrixGenerator = function(roomName) {
    let costs = new PathFinder.CostMatrix();

    let room = Game.rooms[roomName];
    room.find(FIND_STRUCTURES).forEach(function(s) {
        // If structure is something you CAN'T walk over
        if (s.structureType !== STRUCTURE_CONTAINER &&
            (s.structureType !== STRUCTURE_RAMPART || !s.my) &&
            (s.structureType !== STRUCTURE_ROAD)) {
                costs.set(s.pos.x, s.pos.y, 255);
            }
    });
    // Avoid already set construction sites if NOT a road
    room.find(FIND_CONSTRUCTION_SITES).forEach(function(cs) {
        if (cs.structureType !== STRUCTURE_ROAD)
            costs.set(cs.pos.x, cs.pos.y, 255);
    });
    return costs;
};

/**
 * Creates roads to sources stemming from given spawner
 * @param {*.RoomPosition} spawner Anything with a room position will work
 */
Room.prototype.makeRoads = function(spawner) {
    if (!this.controller.my)
        return;
    else if (this.controller.reservation != undefined)
        console.log("Oops! Unexpected behaviour in prototype.room.js");

    if (this.memory.spawnToSourceRoads == undefined || this.memory.spawnToSourceRoads == false) {
        roadsToSources(this, spawner);
        this.memory.spawnToSourceRoads = true;
    } else if (this.memory.spawnToController == undefined || this.memory.spawnToController == false) {
        roadsToController(this, spawner);
        this.memory.spawnToController = true;
    }
};

/**
 * Creates necessary buildings on Contoller level up
 */
Room.prototype.makeStructures = function() {
    if (!this.controller.my || this.memory.controller === 8)
        return;

    /*
    let roads = this.find(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_ROAD});
    for (let i = 0; i < roads.length; i++) {
        this.visual.text(i.toString(), roads[i].pos);
    }
    */

    // If controller just leveled up
    if (this.memory.controller <= this.controller.level) {
        var buildingPlans = cb.buildingPlans[this.controller.level];
        const buildings = Object.keys(buildingPlans);

        buildings.forEach(function(struct) {
            for (i = 0; i < buildingPlans[struct]; i++) {
                // make the thing
            }
        });
    }

    this.memory.controller = this.controller.level;
};

/**
 * Returns a list of Strings of the neighboring rooms
 * @return {<String>[]} a list of roomNames
 */
Room.prototype.getNeighborRooms = function() {
    const rooms = [];
    let cords = this.name.replace(/W|E|S|N/g, " ").trim().split(" ");
    let axis = this.name.replace(/[0-9]/g, "");

    if (axis.charAt(0) === "W") {
        if (this.find(FIND_EXIT_LEFT).length > 0)
            rooms.push( axis.charAt(0) + (parseInt(cords[0])+1).toString() + axis.charAt(1) + cords[1] )
        if (this.find(FIND_EXIT_RIGHT).length > 0)
            rooms.push( axis.charAt(0) + (parseInt(cords[0])-1).toString() + axis.charAt(1) + cords[1] )
    } else /* axis.charAt(0) === "E" */ {
        if (this.find(FIND_EXIT_LEFT).length > 0)
            rooms.push( axis.charAt(0) + (parseInt(cords[0])-1).toString() + axis.charAt(1) + cords[1] )
        if (this.find(FIND_EXIT_RIGHT).length > 0)
            rooms.push( axis.charAt(0) + (parseInt(cords[0])+1).toString() + axis.charAt(1) + cords[1] )
    }
    if (axis.charAt(1) === "N") {
        if (this.find(FIND_EXIT_TOP).length > 0)
            rooms.push( axis.charAt(0) + cords[0] + axis.charAt(1) + (parseInt(cords[1])+1).toString() )
        if (this.find(FIND_EXIT_BOTTOM).length > 0)
            rooms.push( axis.charAt(0) + cords[0] + axis.charAt(1) + (parseInt(cords[1])-1).toString() )
    } else /* axis.charAt(1) === "S" */ {
        if (this.find(FIND_EXIT_TOP).length > 0)
            rooms.push( axis.charAt(0) + cords[0] + axis.charAt(1) + (parseInt(cords[1])-1).toString() )
        if (this.find(FIND_EXIT_BOTTOM).length > 0)
            rooms.push( axis.charAt(0) + cords[0] + axis.charAt(1) + (parseInt(cords[1])+1).toString() )
    }
    return rooms;
};

var roadsToController = function(room, spawn) {
    const controller = room.controller;

    let paths = PathFinder.search(spawn.pos, {pos:controller.pos, range: 1}, {
        swampCost: 1,
        roomCallback: matrixGenerator,
    });

    for (p = 0; p < paths.path.length; p++) {
        //room.visual.circle(paths.path[p]);
        room.createConstructionSite(paths.path[p], STRUCTURE_ROAD);
    }
}

var roadsToSources = function(roomm, spawn) {
    const sources = room.find(FIND_SOURCES).concat(room.find(FIND_MINERALS));

    for (i = 0; i < sources.length; i++) {
        let paths = PathFinder.search(spawn.pos, {pos: sources[i].pos, range: 1}, {
            swampCost: 1,
            roomCallback: matrixGenerator,
        });

        // length - 1 because last spot is for container
        for (p = 0; p < paths.path.length - 1; p++) {
            //room.visual.circle(paths.path[p]);
            room.createConstructionSite(paths.path[p], STRUCTURE_ROAD);
        }
        room.createConstructionSite(paths.path[paths.path.length - 1], STRUCTURE_CONTAINER);
    }
};
