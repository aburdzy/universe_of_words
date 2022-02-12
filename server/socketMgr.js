class SocketMgr {
    static instance = new SocketMgr();
    static io = null;
    
    constructor() {
        this.sockets = [];
        this.userSockets = new Map();
    }

    addSocket(userId, socket) {
        if (this.userSockets.has(userId)) {
            this.userSockets.get(userId).push(socket);
        }
        else {
            this.userSockets.set(userId, [socket]);
        }
    }

    getSocketsByUserId(userId) {
        return this.userSockets.get(userId);
    }
}

module.exports = SocketMgr;