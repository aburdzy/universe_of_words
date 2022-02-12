const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course');
const validate = require('../schemas/course');
const { validateBody, validateParams } = require('../middlewares/validator');
const asyncErrorHandler = require('../helpers/asyncErrorHandler');

router.get('/images/:courseId', validateParams(validate.getImages), asyncErrorHandler(courseController.getImages));
router.get('/courses/:type/:language', validateParams(validate.getCourses), asyncErrorHandler(courseController.getCourses));
router.get('/:courseId/:modify', validateParams(validate.getCourse), asyncErrorHandler(courseController.getCourse));
// router.post('/course-name', validateBody(validate.getCourse), asyncErrorHandler(courseController.getCourseName));
router.put('/update-course-name', validateBody(validate.updateCourseName), asyncErrorHandler(courseController.updateCourseName));
router.put('/update-course-language', validateBody(validate.updateCourseLanguage), asyncErrorHandler(courseController.updateCourseLanguage));
router.delete('/delete/flashcard/:flashcardId', validateParams(validate.deleteFlashcard), asyncErrorHandler(courseController.deleteFlashcard));
router.delete('/delete-course/:courseId', validateParams(validate.deleteCourse), asyncErrorHandler(courseController.deleteCourse));
router.put('/update-course-access', asyncErrorHandler(courseController.updateCourseAccess));
router.put('/update-flashcards', validateBody(validate.updateFlashcards), asyncErrorHandler(courseController.updateFlashcards));
router.post('/insert-flashcards', validateBody(validate.insertFlashcards), asyncErrorHandler(courseController.insertFlashcards));
router.post('/create-course', validateBody(validate.createCourse), asyncErrorHandler(courseController.createCourse));
router.get('/flashcards-amount/:courseId/:filter', validateParams(validate.getFlashcardsAmount), asyncErrorHandler(courseController.getFlashcardsAmount));
router.get('/flashcards/:courseId/:filter/:limit', validateParams(validate.getFlashcards), asyncErrorHandler(courseController.getFlashcards));
router.put('/flashcards-completed', validateBody(validate.setFlashcardsCompleted), asyncErrorHandler(courseController.setFlashcardsCompleted));
router.put('/flashcards-reset-completed', validateBody(validate.resetFlashcardsCompleted), asyncErrorHandler(courseController.resetFlashcardsCompleted));
router.post('/upload-image', asyncErrorHandler(courseController.uploadImage));
router.delete('/delete-image/:flashcardId', validateParams(validate.deleteImage), asyncErrorHandler(courseController.deleteImage));

module.exports = router;