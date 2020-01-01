
module.exports = {

    run: function(creep) {
        // Updates creep's memory variables
        creep.update();

        if (!creep.memory.working) {
            // Sends creep to gather Engery
            creep.getEnergy(true, true, true);
        } else {
            const colony = Memory[creep.memory.home];
            creep.signaledMove(Game.rooms[colony.mainRoomName].controller);
            creep.upgradeController(Game.rooms[colony.mainRoomName].controller);
        }
    }
};
