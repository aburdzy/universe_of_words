const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv();
addFormats(ajv);

//if ok return true
module.exports.userLogin = ajv.compile({
    type: 'object',
    properties: {
        username: { type: 'string' },
        password: { type: 'string' }
    },
    required: ['username', 'password']
});

module.exports.userRegister = ajv.compile({
    type: 'object',
    properties: {
        username: { type: 'string' },
        password: { type: 'string' },
        mail: { type: 'string' }
    },
    required: ['username', 'password', 'mail']
});

module.exports.getMail = ajv.compile({
    type: 'object',
    properties: {
        userId: { type: 'string', format: 'int32' },
    },
    required: ['userId']
});

module.exports.checkUserPermission = ajv.compile({
    type: 'object',
    properties: {
        courseId: { type: 'string', format: 'int32' }
    },
    required: ['courseId']
});

module.exports.updateUsername = ajv.compile({
    type: 'object',
    properties: {
        username: { type: 'string' }
    },
    required: ['username']
});

module.exports.updatePassword = ajv.compile({
    type: 'object',
    properties: {
        oldPassword: { type: 'string' },
        newPassword: { type: 'string' }
    },
    required: ['oldPassword', 'newPassword']
});

module.exports.updateMail = ajv.compile({
    type: 'object',
    properties: {
        mail: { type: 'string' }
    },
    required: ['mail']
});

module.exports.remaindPassword = ajv.compile({
    type: 'object',
    properties: {
        mail: { type: 'string' }
    },
    required: ['mail']
});

module.exports.banUser = ajv.compile({
    type: 'object',
    properties: {
        userId: { type: 'number' }
    },
    required: ['userId']
});

module.exports.deleteUser = ajv.compile({
    type: 'object',
    properties: {
        userId: { type: 'string', format: 'int32' }
    },
    required: ['userId']
});

module.exports.updateSomebodyUsername = ajv.compile({
    type: 'object',
    properties: {
        username: { type: 'string' },
        userId: { type: 'number' }
    },
    required: ['username', 'userId']
});
