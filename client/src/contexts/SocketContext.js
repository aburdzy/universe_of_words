import { createContext } from 'react';
import socketio  from 'socket.io-client';

export const context = {
    setSocket: null,
    conn: null,
    connected: false,
    connect: null,
    disconnect: null,
    reconnect: null
};

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

context.connect = () => {
    const token = getCookie('token');

    if(token !== undefined) {
        const conn = socketio.connect('http://localhost:8080', {
            query: { token },
            cors: { credentials: true, origin: '*' },
            closeOnBeforeunload: false,
            transports : ['websocket'] 
        });

        context.conn = conn;
        context.setSocket((socket) => ({ ...socket, conn }));

        context.conn.on('connect', () => {
            context.setSocket((socket) => ({ ...socket, connected: true }));
        });

        return context.conn;
    }
}

context.disconnect = () => {    
    context.conn.disconnect();
    context.setSocket((socket) => ({ ...socket, connected: false }));
}

context.reconnect = () => {    
    context.conn.disconnect();
    context.setSocket((socket) => ({ ...socket, connected: false }));

    return context.connect();
}

const SocketContext = createContext(context);
export default SocketContext;