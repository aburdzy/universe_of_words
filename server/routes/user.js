const express = require('express');
const router = express.Router();

const validate = require('../schemas/user');
const { validateBody, validateParams } = require('../middlewares/validator');
const userController = require('../controllers/user');
const asyncErrorHandler = require('../helpers/asyncErrorHandler');

router.post('/login', validateBody(validate.userLogin), asyncErrorHandler(userController.login));
router.post('/register', validateBody(validate.userRegister), asyncErrorHandler(userController.register));
router.get('/info', userController.getUserInfo);
router.get('/mail/:userId', validateParams(validate.getMail), asyncErrorHandler(userController.getMail));
router.get('/logout', userController.logout);
router.get('/check-permissions/:courseId', validateParams(validate.checkUserPermission), asyncErrorHandler(userController.checkUserAccess));
router.post('/update-username', validateBody(validate.updateUsername), asyncErrorHandler(userController.updateUsername));
router.post('/update-password', validateBody(validate.updatePassword), asyncErrorHandler(userController.updatePassword));
router.post('/update-mail', validateBody(validate.updateMail), asyncErrorHandler(userController.updateMail));
router.get('/flashcards-completed', asyncErrorHandler(userController.getCompletedFlashcards));
router.post('/remind-password', validateBody(validate.remaindPassword), asyncErrorHandler(userController.remindPassword));
router.get('/get-users', asyncErrorHandler(userController.getUsers));
router.put('/ban-user', validateBody(validate.banUser), asyncErrorHandler(userController.banUser));
router.get('/get-banned', asyncErrorHandler(userController.getUserBan));
router.delete('/delete-user/:userId', validateParams(validate.deleteUser), asyncErrorHandler(userController.deleteUser));
router.put('/update-sb-username', validateBody(validate.updateSomebodyUsername), asyncErrorHandler(userController.updateSomebodyUsername));

module.exports = router;