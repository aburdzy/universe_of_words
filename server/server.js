const dotenv = require('dotenv');
dotenv.config();
process.env.TOKEN_SECRET;

const compression = require('compression');

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const socketMgr = require('./socketMgr');
socketMgr.io = io;

const roomMgr = require('./roomMgr');

const cors = require('cors');
const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken');

app.use(compression());


let publicAccessPaths = [
    '/api/user/login',
    '/api/user/register'
];

app.use('*/images', express.static('public_html/images'));

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/user', require('./routes/user'));
app.use('/api/course', require('./routes/course'));
app.use('/api/multiplayer', require('./routes/multiplayer'));

app.use((req, res, next) => {
    if (publicAccessPaths.indexOf(req.url) == -1) {
        try {
            if (req.cookies.token) {
                jwt.verify(req.cookies.token, process.env.SECRET_KEY);
                next();     
            }
        }
        catch(err) {
            res.json({ status: 'error' });
        }    
    }
    else {
        next();
    }
});

app.use((err, req, res, next) => {
    console.log(err.message);
    console.error(err);

    return res.json({ error: err.message });
});

http.listen(process.env.PORT, 5000, 'localhost', () => {
    var port = http.address().port;
    console.log(`App listening at http://localhost:${port}`)
});

io.use(async (socket, next) => {
        const token = socket.handshake.query.token;

        if(token) {
            const user = await jwt.verify(token, process.env.SECRET_KEY);
            socket.userId = user.id;
        
            socketMgr.instance.addSocket(user.id, socket);

            next();          
        }
        else {
            next(new Error('AUTHENTICATION_ERROR'));
        }
});

io.on('connection', (socket) => {
    socket.rooms.forEach((roomId) => socket.leave(roomId));
    socket.join('lobby');

    console.log('Users amount: ' + socketMgr.instance.userSockets.size);
    console.log('SOCKET_ID: ' + socket.id + ', USER_ID: ' + socket.userId + ' CONNECTED');

    
    socket.on('disconnecting', () => {
        socketMgr.instance.userSockets.delete(socket.userId);

        console.log('SOCKET ID '+ socket.id + ', USER ID ' + socket.userId + ' DISCONNECTED ');
        console.log('Users amount: ' + socketMgr.instance.userSockets.size);
        
        if(!socket.rooms.has('lobby')) {
            for (let [roomId, value] of roomMgr.instance.rooms) {      
                for(let [userId, v] of value.users) {
                    if(userId === socket.userId) {
                        console.log('(DISCONNECTED) user', userId, 'removed from room', roomId);
                        let deleteUser =  roomMgr.instance.removeUserFromRoom(roomId, userId);

                        io.emit('user_left', deleteUser);
                    }
                }
            }
        }
    });
});