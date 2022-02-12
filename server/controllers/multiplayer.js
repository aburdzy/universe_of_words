const jwt = require('jsonwebtoken');
const dbQuery = require('../helpers/dbQuery');
const uuid = require('uuid').v4;

const roomMgr = require('../roomMgr').instance;
const { instance: socketMgr, io } = require('../socketMgr');

const convertMap = (obj, map) => {
    return {...obj, users: Array.from(map) }; 
}

const getRooms = async(req, res, next) => {
    let rooms;

    if(roomMgr.rooms.size === 0) {
        rooms = [];
    }
    else {
        rooms = roomMgr.getAllRooms().map((room) => {
            return (
                {
                    id: room.id,
                    name: room.name,
                    users: Array.from(room.users),
                    isGameInProgress: room.isGameInProgress
                }
            );
        });
    }

    return res.json({ status: 'ok', results: rooms });
}

const createRoom = async (req, res, next) => {
    let { name } = req.body;

    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;
    const username = user.username;

    const roomId = 'match_' + uuid();

    const users = new Map();

    users.set(userId, username);

    let newRoom = { id: roomId, name, host: userId, users, isGameInProgress: false };
 
    roomMgr.addRoom(newRoom);
    let room = { ...newRoom, users: Array.from(newRoom.users) };

    socketMgr.getSocketsByUserId(userId).forEach((socket) => {
        socket.rooms.forEach((roomId) => socket.leave(roomId));
        socket.join(roomId);
        console.log(socket.id + ' (' + userId + ') create a room: ' + roomId);
    });

    io.in('lobby').emit('room_created', room);

    return res.json({ status: 'ok', results: convertMap(newRoom, newRoom.users) });
};

const getRoom = async(req, res, next) => {
    let { roomId } = req.params;
    let room = roomMgr.getRoom(roomId);

    return res.json({
        status: 'ok',
        results: room === undefined ? null : convertMap(room, room.users)
    });
}

const joinRoom = async(req, res, next) => {
    let { roomId } = req.body;

    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;
    const username = user.username;

    if(roomMgr.getRoom(roomId).users.size < 2) {
        roomMgr.addUserToRoom(roomId, userId, username);

        socketMgr.getSocketsByUserId(userId).forEach((socket) => {
            socket.rooms.forEach((roomId) => socket.leave(roomId));
            socket.join(roomId);
            console.log(socket.id + ' (' + userId + ') joined the room: ' + roomId);
        });

        const room = roomMgr.getRoom(roomId);

        io.emit('joined_room', convertMap(room, room.users));
    }

    return res.json({ status: 'ok' });
}

const leaveRoom = async(req, res, next) => {
    let { roomId } = req.body;

    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;

    let room = roomMgr.removeUserFromRoom(roomId, userId);
    
    socketMgr.getSocketsByUserId(userId).forEach((socket) => {
        socket.rooms.forEach((roomId) => socket.leave(roomId));
        socket.join('lobby');
    });

    io.emit('leave_room', room);

    res.json({ status: 'ok' });
}

const getPublicCourses = async(req, res, next) => {
    let { language } = req.params;

    const getPublicCoursesQuery = 
    `SELECT 
        course.course_id,
        course.name,
        COUNT(flashcard.flashcard_id) as amount
    FROM course 
            INNER JOIN flashcard
        ON flashcard.course_id = course.course_id
    WHERE course.public_access = 1 AND course.language = ?
    GROUP BY course.course_id
    HAVING
        amount >= 4;`;

    let results = await dbQuery(getPublicCoursesQuery, [language]).catch((err) => next(err));

    return res.json({ status: 'ok', results });
}

const getCourseOrderedByRandom = async(req, res, next) => {
    let { courseId, roomId } = req.params;
    courseId = parseInt(courseId, 10);

    const getFlashcardsQuery = 
        `SELECT 
            flashcard.flashcard_id,
            flashcard.answer,
            flashcard.question,
            flashcard.course_id,
            image.src
        FROM 
            flashcard
                LEFT JOIN image
            ON flashcard.flashcard_id = image.flashcard_id
        WHERE course_id = ?
        ORDER BY RAND();`;

    let flashcards = await dbQuery(getFlashcardsQuery, [courseId]).catch((err) => next(err));

    if(flashcards.length > 0) {
        io.to(roomId).emit('get_flashcards', flashcards );
        return res.json({ status: 'ok' });
    }
    else {
        return res.json({ status: 'ok' });
    }
}

const startGame = async(req, res, next) => {
    let { roomId } = req.body;

    io.to(roomId).emit('game_started');
    
    roomMgr.updateRoomGameProgress(roomId, true);
    io.emit('game_in_progress', roomId);

    return res.json({ status: 'ok' });
}

const getOpponentResult = async(req, res, next) => {
    let { roomId, points } = req.body;
    
    const user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;
    const username = user.username;

    let usersInRoom = new Map(roomMgr.getRoom(roomId).users);
    usersInRoom.delete(userId);

    let opponentUserId;

    if(usersInRoom.size > 0) {
        opponentUserId = Array.from(usersInRoom)[0][0];
    }
    else {
        return res.json({ status: 'ok' });
    }
    
    socketMgr.getSocketsByUserId(opponentUserId).forEach((socket) => {
        socket.emit('get_result', { username, points } );
    });

    return res.json({ status: 'ok' });
}

const refreshRoom = async(req, res, next) => {
    let { roomId } = req.body;

    roomMgr.updateRoomGameProgress(roomId, false);

    io.emit('room_refreshed', roomId);

    return res.json({ status: 'ok' });
}

const updatePoints = async(req, res, next) => {
    let { points } = req.body;
    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;

    const getUserPointsQuery = 'SELECT points FROM user WHERE user_id = ?;';
    const updateUserPointsQuery = 'UPDATE user SET points = ? WHERE user_id = ?;';

    let currentPoints = await dbQuery(getUserPointsQuery,[userId]).catch((err) => next(err));

    if(currentPoints.length > 0) {
        await dbQuery(updateUserPointsQuery, [currentPoints[0].points + points, userId]).catch((err) => next(err));
    }

    return res.json({ status: 'ok' });
}

const getPoints = async(req, res, next) => {
    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;

    const getUserPointsQuery = 'SELECT points FROM user WHERE user_id = ?;';

    let points = await dbQuery(getUserPointsQuery,[userId]).catch((err) => next(err));

    if(points.length > 0) {
        return res.json({ status: 'ok', result: points[0].points });
    }

    return res.json({ status: 'ok', result: '-'});
}

const getGameMode = async(req, res, next) => {
    let { roomId, gameMode } = req.body;

    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;

    getGameSettings(roomId, userId, 'get_game_mode',  gameMode);

    return res.json({ status: 'ok' });
}

const getGameCourse = async(req, res, next) => {
    let { roomId, courseId, courseName } = req.body;

    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;

    getGameSettings(roomId, userId, 'get_game_course',  { courseId, name: courseName });

    return res.json({ status: 'ok' });
}

const getPlayers = async(req, res, next) => {
    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;
    
    const getUsernameQuery = 'SELECT username FROM user WHERE user_id = ?';

    const usersInLobby = await io.in('lobby').fetchSockets();

    let users = usersInLobby.map((userInLobby) => { 
        return (
            {
                id: userInLobby.userId, 
                username: ''
            }
        );
    });

    users.filter((u) => u.id != userId);

    for(let i = 0; i < users.length; i++) {
        let username = await dbQuery(getUsernameQuery, [users[i].id]).catch((err) => next(err));
        users[i].username = username[0].username;   
    }

    return res.json({ status: 'ok', results: users });
}

const sendInvitation = async(req, res, next) => {
    let { roomId, playerId } = req.body;
    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    socketMgr.getSocketsByUserId(playerId).forEach((socket) => {
        socket.emit('get_invitation', { room: roomId, user: user.username });
    })

    return res.json({ status: 'ok' });
}

const kickPlayer = async(req, res, next) => {
    let { roomId, playerId } = req.body;
    
    socketMgr.getSocketsByUserId(playerId).forEach((socket) => {
        socket.rooms.forEach((roomId) => socket.leave(roomId));
        
        socket.emit('kick_player');
        socket.join('lobby');
    });

    res.json({ status: 'ok' });
}

const getGameTime = async(req, res, next) => {
    let { roomId, gameTime } = req.body;

    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;

    getGameSettings(roomId, userId, 'get_game_time', gameTime);

    return res.json({ status: 'ok' });
}

const getGameLanguage = async(req, res, next) => {
    let { roomId, gameLanguage } = req.body;

    const user = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const userId = user.id;

    getGameSettings(roomId, userId, 'get_game_language', gameLanguage);

    return res.json({ status: 'ok' });
}

const getGameSettings = (roomId, userId, event, listener) => {
    let room = roomMgr.getRoom(roomId);
    let usersInRoom = new Map(room.users);

    if(usersInRoom.size > 1) {
        usersInRoom.delete(userId);
        let opponentId = Array.from(usersInRoom)[0][0];

        socketMgr.getSocketsByUserId(opponentId).forEach((socket) => {
            socket.emit(event,  listener);
        });
    }
}

module.exports = {
    getRooms,
    getRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    getPublicCourses,
    getCourseOrderedByRandom,
    startGame,
    getOpponentResult,
    refreshRoom,
    updatePoints,
    getPoints,
    getGameMode,
    getGameCourse,
    getPlayers,
    sendInvitation,
    kickPlayer,
    getGameTime,
    getGameLanguage
} 