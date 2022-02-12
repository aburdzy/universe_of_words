class RoomMgr {
    static instance = new RoomMgr();
    
    constructor() {
        this.rooms = new Map();
    }

    getAllRooms() {
        return [...this.rooms.values()];
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    updateRoomGameProgress(roomId, isGameInProgress) {
        let room = this.rooms.get(roomId);
        this.rooms.set(roomId, {...room, isGameInProgress: isGameInProgress });
    }

    addRoom(room) {
        this.rooms.set(room.id, room);
    }

    addUserToRoom(roomId, userId, username) {
        const room = this.rooms.get(roomId);
        const users = room.users.set(userId, username);
        const roomWithNewUser = { ...room, users };

        this.rooms.set(roomId, roomWithNewUser);
    }

    removeUserFromRoom(roomId, userId) {
        const room = this.rooms.get(roomId);
        
        if(room.users.size > 1) {
            room.users.delete(userId);
            console.log('User', userId, 'left room', roomId);

            const iterator = room.users.keys();
            const host = iterator.next().value;

            let newRoom = {
                ...room,
                host,
                users: Array.from(room.users)
            }

            this.rooms.set(roomId, { ...room, host, users: room.users });

            return { id: roomId, room: newRoom };
        }
        else if(room.users.size == 1) {
            this.rooms.delete(roomId);
            console.log('Room was closed ', roomId, 'User', userId, 'left room.');
            
            return { id: roomId, room: null };
        }
    }
}

module.exports = RoomMgr;