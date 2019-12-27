var cb = require("controlBoard");

Room.prototype.makeRoads = function() {
    if (!this.controller.my)
        return;
    else if (this.controller.reservation != undefined)
        console.log("Oops! Unexpected behaviour in prototype.room.js");

    const spawns = this.find(FIND_STRUCTURES, {filter:
        (s) => s.structureType === STRUCTURE_SPAWN});
    if (this.memory.spawnToSourceRoads == undefined || this.memory.spawnToSourceRoads == false) {
        const sources = this.find(FIND_SOURCES);

        for (i = 0; i < sources.length; i++) {
            let paths = PathFinder.search(spawns[0].pos, {pos: sources[i].pos, range: 1}, {
                swampCost: 1,
                roomCallback: function(roomName) {
                    let costs = new PathFinder.CostMatrix();
                    let room = Game.rooms[roomName];
                    room.find(FIND_STRUCTURES).forEach(function(s) {
                        // If structure is something you CAN'T walk over
                        if (s.structureType !== STRUCTURE_CONTAINER &&
                            (s.structureType !== STRUCTURE_RAMPART || !s.my)) {
                                costs.set(s.pos.x, s.pos.y, 255);
                            }
                    });
                    // Avoid already set construction sites
                    room.find(FIND_CONSTRUCTION_SITES).forEach(function(cs) {
                        costs.set(cs.pos.x, cs.pos.y, 255);
                    });
                    return costs;
                },
            });

            for (p = 0; p < paths.path.length - 1; p++) {
                this.createConstructionSite(paths.path[p], STRUCTURE_ROAD);
            }
        }

        this.memory.spawnToSourceRoads = true;
    }
}
