const express = require('express');
const router = express.Router();

const multiplayerController = require('../controllers/multiplayer');
const validate = require('../schemas/multiplayer');
const { validateBody, validateParams } = require('../middlewares/validator');
const asyncErrorHandler = require('../helpers/asyncErrorHandler');

router.get('/rooms', asyncErrorHandler(multiplayerController.getRooms));
router.post('/room', validateBody(validate.createRoom), asyncErrorHandler(multiplayerController.createRoom));
router.get('/:roomId', validateParams(validate.getRoom), asyncErrorHandler(multiplayerController.getRoom));
router.post('/join-room', validateBody(validate.joinRoom), asyncErrorHandler(multiplayerController.joinRoom));
router.post('/leave-room', validateBody(validate.leaveRoom), asyncErrorHandler(multiplayerController.leaveRoom));
router.get('/courses/public/:language', asyncErrorHandler(multiplayerController.getPublicCourses));
router.post('/start-game', validateBody(validate.startGame), asyncErrorHandler(multiplayerController.startGame));
router.get('/get-course-ordered-by-random/:courseId/:roomId', validateParams(validate.getCourseOrderedByRandom), asyncErrorHandler(multiplayerController.getCourseOrderedByRandom));
router.post('/get-result', validateBody(validate.getOpponentResult), asyncErrorHandler(multiplayerController.getOpponentResult));
router.post('/refresh-room', validateBody(validate.refreshRoom), asyncErrorHandler(multiplayerController.refreshRoom));
router.put('/update-points', validateBody(validate.updatePoints), asyncErrorHandler(multiplayerController.updatePoints));
router.get('/game/get-points', asyncErrorHandler(multiplayerController.getPoints));
router.post('/game-mode', validateBody(validate.getGameMode), asyncErrorHandler(multiplayerController.getGameMode));
router.post('/game-course', validateBody(validate.getGameCourse), asyncErrorHandler(multiplayerController.getGameCourse));
router.get('/game/invite-user', asyncErrorHandler(multiplayerController.getPlayers));
router.post('/send-invitation', validateBody(validate.sendInvitation), asyncErrorHandler(multiplayerController.sendInvitation));
router.post('/kick-player', validateBody(validate.kickPlayer), asyncErrorHandler(multiplayerController.kickPlayer));
router.post('/game-time', validateBody(validate.getGameTime), asyncErrorHandler(multiplayerController.getGameTime));
router.post('/game-language', validateBody(validate.getGameLanguage), asyncErrorHandler(multiplayerController.getGameLanguage));

module.exports = router;