const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv();
addFormats(ajv);

module.exports.getRoom = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string' },
        edit: { type: 'boolean' }
    },
    required: ['roomId']
});

module.exports.createRoom = ajv.compile({
    type: 'object',
    properties: {
        room: { type: 'string' }
    },
    required: ['name']
});

module.exports.joinRoom = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string' }
    },
    required: ['roomId']
});

module.exports.leaveRoom = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string' }
    },
    required: ['roomId']
});

module.exports.getPublicCourses = ajv.compile({
    type: 'object',
    properties: {
        language: { type: 'string' }
    },
    required: ['language']
});

module.exports.startGame = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string' }
    },
    required: ['roomId']
});

module.exports.getCourseOrderedByRandom = ajv.compile({
    type: 'object',
    properties: {
        courseId: { type: 'string'},
        roomId: { type: 'string'},
    },
    required: ['courseId', 'roomId']
});

module.exports.getOpponentResult = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string'},
        points: { type: 'number'}
    },
    required: ['roomId', 'points']
});

module.exports.refreshRoom = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string'},
    },
    required: ['roomId']
});

module.exports.updatePoints = ajv.compile({
    type: 'object',
    properties: {
        points: { type: 'number'},
    },
    required: ['points']
});

module.exports.getGameMode = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string'},
        gameMode: { type: 'number'},
    },
    required: ['roomId', 'gameMode']
});

module.exports.getGameCourse = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string'},
        courseId: { type: 'number'},
        courseName: { type: 'string' }
    },
    required: ['roomId', 'courseId', 'courseName']
});

module.exports.sendInvitation = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string'},
        playerId: { type: 'number'},
    },
    required: ['roomId', 'playerId']
});

module.exports.kickPlayer = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string'},
        playerId: { type: 'number'},
    },
    required: ['roomId', 'playerId']
});

module.exports.getGameTime = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string' },
        gameTime: { type: 'number' }
    },
    required: ['roomId', 'gameTime']
});

module.exports.getGameLanguage = ajv.compile({
    type: 'object',
    properties: {
        roomId: { type: 'string' },
        gameLanguage: { type: 'string' }
    },
    required: ['roomId', 'gameLanguage']
});
