const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv();
addFormats(ajv);

module.exports.getCourses = ajv.compile({
    type: 'object',
    properties: {
        type: { type: 'string', format: 'int32' },
        language: { type: 'string' }
    },
    required: ['type', 'language']
});

module.exports.getCourse = ajv.compile({
    type: 'object',
    properties: {
        courseId: { type: 'string', format: 'int32' },
        modify: { type: 'string', format: 'int32' }
    },
    required: ['courseId', 'modify']
});

module.exports.updateCourseName = ajv.compile({
    type: 'object',
    properties: {
        courseId: { type: 'string', format: 'int32' },
        courseName: { type: 'string' }
    },
    required: ['courseId', 'courseName']
});

module.exports.updateCourseLanguage = ajv.compile({
    type: 'object',
    properties: {
        courseId: { type: 'string', format: 'int32' },
        language: { type: 'string' }
    },
    required: ['courseId', 'language']
});

module.exports.deleteFlashcard = ajv.compile({
    type: 'object',
    properties: {
        flashcardId: { type: 'string', format: 'int32' }
    },
    required: ['flashcardId']
});

module.exports.deleteCourse = ajv.compile({
    type: 'object',
    properties: {
        courseId: { type: 'string', format: 'int32' }
    },
    required: ['courseId']
});

module.exports.updateFlashcards = ajv.compile({
    type: 'object',
    properties: {
        flashcards: { type: 'array' }
    },
    required: ['flashcards']
});

module.exports.insertFlashcards = ajv.compile({
    type: 'object',
    properties: {
       flashcards: { type: 'array' }
    },
    required: ['flashcards']
});

module.exports.createCourse = ajv.compile({
    type: 'object',
    properties: {
        flashcards: { type: 'array' },
        courseName: { type: 'string' },
        publicAccess: { type: 'number' },
        language: { type: 'string' }
    },
    required: ['flashcards', 'courseName', 'publicAccess', 'language']
});

module.exports.getFlashcardsAmount = ajv.compile({
    type: 'object',
    properties: {
        courseId: { type: 'string', format: 'int32' },
        filter:  { type: 'string', format: 'int32' }
    },
    required: ['courseId', 'filter']
});

module.exports.getFlashcards = ajv.compile({
    type: 'object',
    properties: {
        courseId: { type: 'string', format: 'int32' },
        limit: { type: 'string', format: 'int32' },
        filter: { type: 'string', format: 'int32' },
    },
    required: ['courseId', 'filter']
});

module.exports.setFlashcardsCompleted = ajv.compile({
    type: 'object',
    properties: {
        flashcards: { type: 'array' }
    },
    required: ['flashcards']
});

module.exports.resetFlashcardsCompleted = ajv.compile({
    type: 'object',
    properties: {
        courseId: { type: 'number' }
    },
    required: ['courseId']
});

module.exports.getImages = ajv.compile({
    type: 'object',
    properties: {
        courseId: { type: 'string', format: 'int32' },
    },
    required: ['courseId']
});

module.exports.deleteImage = ajv.compile({
    type: 'object',
    properties: {
        flashcardId: { type: 'string', format: 'int32' }
    },
    required: ['flashcardId']
});

