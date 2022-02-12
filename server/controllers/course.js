const jwt = require('jsonwebtoken');
const dbQuery = require('../helpers/dbQuery');
const upload  = require('../helpers/uploadImage');
const fs = require('fs-extra');

const deleteCourseQuery = 'DELETE FROM course WHERE course_id = ?;';
const deleteUserCourseQuery = 'DELETE FROM user_course WHERE course_id = ?;';

const getCourses = async(req, res, next) => {
    let { type, language } = req.params;
    type = parseInt(type, 10);
    
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const findBasicCoursesQuery = 
        `SELECT 
            user.user_id, 
            course.course_id, 
            course.public_access,
            user_course.completed,
            course.name,
            COUNT(flashcard.flashcard_id) AS amount,
            SUM(IF(user_flashcard.completed = 0, 1, 0)) AS uncompleted_flashcards,
            SUM(IF(user_flashcard.completed = 1, 1, 0)) AS completed_flashcards
        FROM 
            user 
                INNER JOIN 
            user_course ON user_course.user_id = user.user_id 
                INNER JOIN 
            course ON user_course.course_id = course.course_id 
                INNER JOIN 
            flashcard ON course.course_id = flashcard.course_id 
                INNER JOIN
            user_flashcard on flashcard.flashcard_id = user_flashcard.flashcard_id 
            AND user.user_id = user_flashcard.user_id
        WHERE 
            user.user_id = ? AND course.public_access = 1 AND course.owner_id = 1 AND course.language = ?
        GROUP BY user.user_id, course.course_id;`;

    const findBasicCoursesForAdminQuery =   
        `SELECT 
            user.user_id, 
            course.course_id, 
            course.public_access,
            user_course.completed,
            course.name,
            COUNT(flashcard.flashcard_id) AS amount,
            SUM(IF(user_flashcard.completed = 0, 1, 0)) AS uncompleted_flashcards,
            SUM(IF(user_flashcard.completed = 1, 1, 0)) AS completed_flashcards
        FROM 
            user 
                INNER JOIN 
            user_course ON user_course.user_id = user.user_id 
                INNER JOIN 
            course ON user_course.course_id = course.course_id 
                INNER JOIN 
            flashcard ON course.course_id = flashcard.course_id 
                INNER JOIN
            user_flashcard on flashcard.flashcard_id = user_flashcard.flashcard_id 
            AND user.user_id = user_flashcard.user_id
        WHERE 
            user.user_id = ? AND course.owner_id = 1 AND course.language = ?
        GROUP BY user.user_id, course.course_id;`;

    const findAllBasicCoursesQuery = 
        `SELECT 
            user.user_id, 
            course.course_id, 
            course.public_access,
            user_course.completed,
            course.name,
            COUNT(flashcard.flashcard_id) AS amount,
            COUNT(flashcard.flashcard_id) AS uncompleted_flashcards
        FROM 
            user 
                INNER JOIN 
            user_course ON user_course.user_id = user.user_id 
                INNER JOIN 
            course ON user_course.course_id = course.course_id 
                INNER JOIN 
            flashcard ON course.course_id = flashcard.course_id 
        WHERE 
            user.user_id = ? AND course.public_access = 1 AND course.owner_id = 1 AND course.language = ?
        GROUP BY user.user_id, course.course_id;`;

    const findMineCoursesQuesy = 
        `SELECT 
            user.user_id, 
            course.course_id,
            course.public_access, 
            user_course.completed,
            course.name, 
            COUNT(flashcard.flashcard_id) AS amount,
            SUM(IF(user_flashcard.completed = 0, 1, 0)) AS uncompleted_flashcards,
            SUM(IF(user_flashcard.completed = 1, 1, 0)) AS completed_flashcards
        FROM 
            user 
                INNER JOIN 
            user_course ON user_course.user_id = user.user_id 
                INNER JOIN 
            course ON user_course.course_id = course.course_id 
                INNER JOIN 
            flashcard ON course.course_id = flashcard.course_id 
                INNER JOIN
            user_flashcard on flashcard.flashcard_id = user_flashcard.flashcard_id AND user.user_id = user_flashcard.user_id
        WHERE 
            course.owner_id = ? AND user.user_id = ? AND course.language = ?
        GROUP BY user.user_id, course.course_id;`;

    const findOtherCoursesQuery = 
        `SELECT 
            user.user_id, 
            course.course_id,
            course.public_access, 
            user_course.completed,
            course.name, 
            COUNT(flashcard.flashcard_id) AS amount,
            SUM(IF(user_flashcard.completed = 0, 1, 0)) AS uncompleted_flashcards,
            SUM(IF(user_flashcard.completed = 1, 1, 0)) AS completed_flashcards
        FROM 
            user 
                INNER JOIN 
            user_course ON user_course.user_id = user.user_id 
                INNER JOIN 
            course ON user_course.course_id = course.course_id 
                INNER JOIN 
            flashcard ON course.course_id = flashcard.course_id 
                INNER JOIN
            user_flashcard on flashcard.flashcard_id = user_flashcard.flashcard_id AND user.user_id = user_flashcard.user_id
        WHERE 
            course.owner_id != ? AND course.owner_id != 1 AND user.user_id = ? AND course.public_access = 1 AND course.language = ?
        GROUP BY user.user_id, course.course_id;`;

    const findAllOtherCoursesQuery = 
        `SELECT 
            user.user_id, 
            course.course_id, 
            course.public_access,
            user_course.completed,
            course.name,
            COUNT(flashcard.flashcard_id) AS amount,
            COUNT(flashcard.flashcard_id) AS uncompleted_flashcards
        FROM 
            user 
                INNER JOIN 
            user_course ON user_course.user_id = user.user_id 
                INNER JOIN 
            course ON user_course.course_id = course.course_id 
                INNER JOIN 
            flashcard ON course.course_id = flashcard.course_id 
        WHERE 
            course.owner_id != ? AND course.owner_id != 1 AND user.user_id = ? AND course.public_access = 1 AND course.language = ?
        GROUP BY user.user_id, course.course_id;`;

    let userCourses = [];
    let allCourses = [];

    if(type === 0 && user.id === 1) {
        userCourses = await dbQuery(findBasicCoursesForAdminQuery, [user.id, language]).catch((err) => next(err));

        if(userCourses.length > 0) {
            return res.json({ status: 'ok' , results: userCourses});
        }
        else {
            return res.json({ status: 'ok' , results: []});
        }        
    }

    if(type === 0) {
        userCourses = await dbQuery(findBasicCoursesQuery, [user.id, language]).catch((err) => next(err));
        allCourses = await dbQuery(findAllBasicCoursesQuery, [user.id, language]).catch((err) => next(err));
    }
    else if(type === 1) {
        userCourses = await dbQuery(findMineCoursesQuesy, [user.id, user.id, language]).catch((err) => next(err));
    }
    else {
        userCourses = await dbQuery(findOtherCoursesQuery, [user.id, user.id, language]).catch((err) => next(err));
        allCourses = await dbQuery(findAllOtherCoursesQuery, [user.id, user.id, language]).catch((err) => next(err));
    }

    if(userCourses.length > 0) {
        if(userCourses.length === allCourses?.length) {
            return res.json({ status: 'ok' , results: userCourses.sort((a, b) => a.name > b.name ? 1 : -1) });
        }

        let userCoursesId = userCourses.map((element) => element.course_id);
        let allCouresesId = allCourses.map((element) => element.course_id);

        for(let i = 0; i < allCouresesId.length; i++) {
            if(!userCoursesId.includes(allCouresesId[i])) {
                userCourses.push(allCourses[i]);
                userCoursesId.push(allCouresesId[i]);
            }
        }

        return res.json({ status: 'ok', results: userCourses.sort((a, b) => a.name > b.name ? 1 : -1) });
        
    }
    else {
        if(allCourses?.length > 0) {
            return res.json({ status: 'ok' , results: allCourses.sort((a, b) => a.name > b.name ? 1 : -1) });    
        }
        
        return res.json({ status: 'ok' , results: [] });
    }
}

const getCourse = async(req, res, next) => {
    let { courseId, modify } = req.params;
    courseId = parseInt(courseId, 10);
    modify = parseInt(modify, 10);
    const user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    let userCourseConnectionQuery = 
        `SELECT 
             user.user_id, 
             course.owner_id
         FROM 
             user 
                 INNER JOIN 
             user_course 
             ON user_course.user_id = user.user_id 
                 INNER JOIN 
             course 
             ON user_course.course_id = course.course_id 
         WHERE 
            user.user_id = ? AND course.course_id = ?;`;

    const getFlashcardsQuery = 
        `SELECT  
            flashcard.flashcard_id,
            flashcard.course_id,
            flashcard.question,
            flashcard.answer,
            user_flashcard.completed,
            course.name,
            course.public_access,
            course.language
        FROM 
            flashcard
                INNER JOIN
            user_flashcard
            ON	user_flashcard.flashcard_id = flashcard.flashcard_id
                INNER JOIN
            course
            ON flashcard.course_id = course.course_id
        WHERE user_flashcard.user_id = ? AND flashcard.course_id = ?;`

    const findFlashcardsInCourse = 'SELECT flashcard_id FROM flashcard WHERE course_id = ?;';
    const insertUserFlashcardsQuery = 'INSERT INTO user_flashcard (flashcard_id, user_id, completed) VALUES (?, ?, ?);';
    
    let userCourseConnection = await dbQuery(userCourseConnectionQuery, [user.id, courseId]).catch((err) => next(err));

    if(modify) {
        if(userCourseConnection[0].user_id !== userCourseConnection[0].owner_id) {
            return next(new Error('NO_PERMISSION'));
        }    
    }
    else {
        if(!userCourseConnection.length > 0 ) {
            return next(new Error('NO_PERMISSION'));
        }
    }

    let flashcards = await dbQuery(getFlashcardsQuery, [user.id, courseId]).catch((err) => next(err));

    if(flashcards.length > 0) {
        return res.json({ status: 'ok', results: flashcards, permissions: userCourseConnection });
    }
    else {
        let flashcardsId = await dbQuery(findFlashcardsInCourse, [courseId]).catch((err) => next(err));
        for(let i = 0; i < flashcardsId.length; i++) {
            await dbQuery(insertUserFlashcardsQuery, [flashcardsId[i].flashcard_id, user.id, 0]).catch((err) => next(err));
        }

        let results = await dbQuery(getFlashcardsQuery, [user.id, courseId]).catch((err) => next(err));
        if(results.length > 0) {
            return res.json({ status: 'ok', results, permissions: userCourseConnection });
        }

        return res.json({ status: 'ok', results: [] });
    }
}

const getCourseName = async(req, res, next) => {
    let { courseId } = req.body;
    const courseNameQuery = 'SELECT name FROM course WHERE course_id = ?';

    let courseName = await dbQuery(courseNameQuery, [courseId]).catch((err) => next(err));

    if(courseName.length > 0) {
        return res.json({ status: 'ok', result });
    }
    else {
        res.json({ status: 'ok', result: [] });
    }
}

const updateCourseName = async(req, res, next) => {
    let { courseId, courseName } = req.body;
    courseId = parseInt(courseId, 10);

    const updateCourseNameQuery = 'UPDATE course SET name = ? WHERE course_id = ?;';

    await dbQuery(updateCourseNameQuery, [courseName, courseId])
        .then(() => { return res.json({ status: 'ok '})})
        .catch((err) => next(err));
}

const updateCourseLanguage = async(req, res, next) => {
    let { courseId, language } = req.body;
    courseId = parseInt(courseId, 10);

    const updateCourseLanguageQuery = 'UPDATE course SET language = ? WHERE course_id = ?;';

    await dbQuery(updateCourseLanguageQuery, [language, courseId])
        .then(() => { return res.json({ status: 'ok '})})
        .catch((err) => next(err));
}

const deleteCourse = async(req, res, next) => {
    let { courseId } = req.params;
    courseId = parseInt(courseId, 10);
    const user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const deleteFlashcardsQuery = 'DELETE FROM flashcard WHERE course_id = ?;';
    const findFlashcardsId = 'SELECT flashcard_id from flashcard WHERE course_id = ?;';
    const deleteUserFlashcardQuery = 'DELETE FROM user_flashcard WHERE flashcard_id = ?;';
    const findImageSrcQuery = 'SELECT src FROM image WHERE flashcard_id = ?;';
    const deleteImageQuery = 'DELETE FROM image WHERE flashcard_id = ?;';

    let checkPermission = await checkUserPermissions(courseId, user.id).catch((err) => next(err));
    if(!checkPermission.length > 0) {
        return next(new Error('NO_PERMISSION'));
    }

    let flashcardsIdToDelete = await dbQuery(findFlashcardsId, [courseId]).catch((err) => next(err));
    let imagesSrc = [];

    for(let i = 0; i < flashcardsIdToDelete.length; i++) {
        await dbQuery(deleteUserFlashcardQuery, [flashcardsIdToDelete[i].flashcard_id]).catch((err) => next(err));
        
        let result = await dbQuery(findImageSrcQuery, [flashcardsIdToDelete[i].flashcard_id]).catch((err) => next(err));
        if(result.length > 0) {
            imagesSrc.push(result[0].src);
        }

        await dbQuery(deleteImageQuery, [flashcardsIdToDelete[i].flashcard_id]).catch((err) => next(err));
    }

    for(let i = 0; i < imagesSrc.length; i++) {
        try {
            await fs.unlink(imagesSrc[i]);
        }
        catch(err) {
            return next(new Error(err.message));
        }
    }

    await dbQuery(deleteFlashcardsQuery, [courseId]).catch((err) => next(err));
    await dbQuery(deleteUserCourseQuery, [courseId]).catch((err) => next(err));
    await dbQuery(deleteCourseQuery, [courseId]).catch((err) => next(err));

    return res.json({ status: 'ok' });
}

const deleteFlashcard = async(req, res, next) => {
    const { flashcardId } = req.params;
    const user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    let courseId;

    const findCourseIdQuery = 'SELECT course_id from flashcard WHERE flashcard_id = ?';
    const deleteFlashcardQuery = 'DELETE FROM flashcard WHERE flashcard_id = ?;';
    const checkFlashcardAmountQuery = 'SELECT flashcard_id FROM flashcard WHERE course_id = ?;';
    const deleteUserFlashcardQuery = 'DELETE FROM user_flashcard WHERE flashcard_id = ?;';
    const checkCompletedCourseQuery = 
        `SELECT 
            SUM(IF(user_flashcard.completed = 0, 1, 0)) AS uncompleted_flashcards,
            user.user_id
        FROM
            user
                INNER JOIN user_flashcard
            ON user.user_id = user_flashcard.user_id
                INNER JOIN flashcard
            ON user_flashcard.flashcard_id = flashcard.flashcard_id
        WHERE 
            user.user_id = ? AND flashcard.course_id = ?;`;
    const findUsersFlashcardQuery = 
        `SELECT 
            user_flashcard.user_id
        FROM 
            user_flashcard
                INNER JOIN flashcard
            ON user_flashcard.flashcard_id = flashcard.flashcard_id 
        WHERE flashcard.course_id = ?
        GROUP BY user_flashcard.user_id;`;
    const setCourseCompletedQuery = 'UPDATE user_course SET completed = 1 WHERE course_id = ? AND user_id = ?;';
    const findImageSrcQuery = 'SELECT src FROM image WHERE flashcard_id = ?;';
    const deleteImageQuery = 'DELETE FROM image WHERE flashcard_id = ?;';

    let findCourseId =  await dbQuery(findCourseIdQuery, [flashcardId]).catch((err) => next(err));
    
    if(!findCourseId.length > 0) {
        return next(new Error('COURSE_NOT_FOUND'));
    }

    courseId = findCourseId[0].course_id;

    let checkPermission = await checkUserPermissions(courseId, user.id).catch((err) => next(err));
    if(!checkPermission.length > 0) {
        return next(new Error('NO_PERMISSION'));
    }

    await dbQuery(deleteUserFlashcardQuery, [flashcardId]).catch((err) => next(err));
    await dbQuery(deleteFlashcardQuery, [flashcardId]).catch((err) => next(err));

    let image = await dbQuery(findImageSrcQuery, [flashcardId]).catch((err) => next(err));
    
    if(image.length > 0) {
        await dbQuery(deleteImageQuery, [flashcardId]).catch((err) => next(err));

        try {
            await fs.unlink(image[0].src);
        }
        catch(err) {
            return next(new Error(err.message));
        }
    }

    let checkFlashcardAmount =  await dbQuery(checkFlashcardAmountQuery, [courseId]).catch((err) => next(err));

    if(checkFlashcardAmount.length > 0) {
        let users = await dbQuery(findUsersFlashcardQuery, [courseId]);
        let checkCompletedCourse = [];

        for(let i = 0; i < users.length; i++) {
            await dbQuery(checkCompletedCourseQuery, [users[i].user_id, courseId])
                .then((res) => { checkCompletedCourse.push(res[0]); })
                .catch((err) => next(err));
        }

        for(let i = 0; i < checkCompletedCourse.length; i++) {
            if(checkCompletedCourse[i].uncompleted_flashcards === 0) {
                await dbQuery(setCourseCompletedQuery, [courseId, checkCompletedCourse[i].user_id]).catch((err) => next(err));
            }
        }

        return res.json({ status: 'ok' });
    }
    
    await dbQuery(deleteCourseQuery, [courseId]).catch((err) => next(err));
    return res.json({ status: 'ok', redirect: true });
}

const updateCourseAccess = async(req, res, next) => {
    let { courseId, publicAccess } = req.body;
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    
    const updateCourseAccessQuery = 'UPDATE course SET public_access = ? WHERE course_id = ?';
    const findUsersQuery = 'SELECT user_id FROM user';
    const insertPublicCourseQuery = 'INSERT INTO user_course (user_id, course_id, completed) values (?, ?, ?);';
    const removeNotPublicCourse = 'DELETE FROM user_course WHERE user_id = ? AND course_id = ?;';
    const removeUserFlashcardQuery = 'DELETE FROM user_flashcard WHERE user_id = ? AND flashcard_id = ?';

    let checkPermission = await checkUserPermissions(courseId, user.id).catch((err) => next(err));

    if(!checkPermission.length > 0) {
        return next(new Error('NO_PERMISSION'));
    }

    await dbQuery(updateCourseAccessQuery, [publicAccess, courseId]).catch((err) => next(err));
    let users = await dbQuery(findUsersQuery).catch((err) => next(err));

    if(users.length > 0) {
        let flashcardsId = await dbQuery('SELECT flashcard_id FROM flashcard WHERE course_id = ?;', [courseId]).catch((err) => next(err));

        for(let i = 0; i < users.length; i++) {
            if(users[i].user_id !== user.id) {
                if(publicAccess) {
                    await dbQuery(insertPublicCourseQuery, [users[i].user_id, courseId, 0]).catch((err) => next(err));
                }
                else if(!publicAccess) {
                    await dbQuery(removeNotPublicCourse, [users[i].user_id, courseId]).catch((err) => next(err));

                    for(let j = 0; j < flashcardsId.length; j++) {
                        await dbQuery(removeUserFlashcardQuery, [users[i].user_id, flashcardsId[j].flashcard_id]).catch((err) => next(err));
                    }
                }
            }
        }
        return res.json({ status: 'ok' });
    }
    return next(new Error('USERS_NOT_FOUND'));
}

const updateFlashcards = async(req, res, next) => {
    let { flashcards } = req.body;
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const courseId = flashcards[0].course_id;

    const updateFlashcardQuery = 'UPDATE flashcard SET question = ?, answer = ? WHERE flashcard_id = ?;';

    let checkPermission = await checkUserPermissions(courseId, user.id).catch((err) => next(err));

    if(!checkPermission.length > 0) {
        return next(new Error('NO_PERMISSION'));
    }

    for(let i = 0; i < flashcards.length; i++) {
        await dbQuery(updateFlashcardQuery, [flashcards[i].question, flashcards[i].answer, flashcards[i].flashcard_id]).catch((err) => next(err));
    }
    
    return res.json({ status: 'ok' });
}

const insertFlashcards = async(req, res, next) => {
    let { flashcards } = req.body;
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const courseId = flashcards[0].course_id;

    const insertFlashcardQuery = 'INSERT INTO flashcard (course_id, question, answer) value (?, ?, ?);';
    const coursePublicAccessQuery = 'SELECT public_access FROM course WHERE course_id = ?';
    const findUsersFlashcardQuery = 
        `SELECT 
            user_flashcard.user_id 
        FROM 
            user_flashcard
                INNER JOIN flashcard
            ON user_flashcard.flashcard_id = flashcard.flashcard_id 
        WHERE flashcard.course_id = ?
        GROUP BY user_flashcard.user_id;`;
    const insertUserFlashcardQuery = 'INSERT INTO user_flashcard (flashcard_id, user_id, completed) values (?, ?, ?);';
    const checkIsCouseFinished = 'SELECT user_id FROM user_course WHERE course_id = ? AND completed = 1;';
    const setCourseUncompleted = 'UPDATE user_course SET completed = 0 WHERE course_id = ? AND user_id = ?;';

    let checkPermission = await checkUserPermissions(courseId, user.id).catch((err) => next(err));

    if(!checkPermission.length > 0) {
        return next(new Error('NO_PERMISSION'));
    }

    let newFlashcardsId = [];
    let images = [];

    for(let i = 0; i < flashcards.length; i++) {
        await dbQuery(insertFlashcardQuery, [flashcards[i].course_id, flashcards[i].question, flashcards[i].answer])
            .then((result) => { 
                newFlashcardsId.push(result.insertId);
                
                if(flashcards[i].image !== null) {
                    images.push({ flashcardId: result.insertId, tmpFlashcardId: flashcards[i].flashcard_id });
                }
            })
            .catch((err) => next(err));
    }

    let publicAccess = await dbQuery(coursePublicAccessQuery, [courseId]).catch((err) => next(err));

    let users = [];

    if(publicAccess[0].public_access) {
        users = await dbQuery(findUsersFlashcardQuery, [courseId]).catch((err) => next(err));
        
        for(let i = 0; i < flashcards.length; i++) {
            for(let j = 0; j < users.length; j++) {
                await dbQuery(insertUserFlashcardQuery, [newFlashcardsId[i], users[j].user_id, 0]).catch((err) => next(err));
            }
        }

        if(users.length > 0) {
            let completed = [];
            for(let i = 0; i < users.length; i++) {
                completed = await dbQuery(checkIsCouseFinished, [courseId, users[i]]).catch((err) => next(err));
            }
    
            if(completed.length > 0) {
                for(let i = 0; i < completed.length; i++) {
                    await dbQuery(setCourseUncompleted, [courseId, completed[i].user_id]).catch((err) => next(err));
                }
            }
        }
    }
    else {
        for(let i = 0; i < flashcards.length; i++) {
            await dbQuery(insertUserFlashcardQuery, [newFlashcardsId[i], user.id, 0]).catch((err) => next(err));
        }

        let isCompleted = await dbQuery(checkIsCouseFinished, [courseId, user.id]).catch((err) => next(err));

        if(isCompleted.length > 0) {
            await dbQuery(setCourseUncompleted, [courseId, user.id]);
        }
    }

    return res.json({ status: 'ok', images });
}

const createCourse = async(req, res, next) => {
    let { flashcards, courseName, publicAccess, language } = req.body;
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const ownerId = user.id;

    const checkIsBannedQuery = 'SELECT banned FROM user WHERE user_id = ?';
    const insertCourseQuery = 'INSERT INTO course (name, public_access, owner_id, language) values (?, ?, ?, ?)';
    const insertFlashcardQuery = 'INSERT INTO flashcard (course_id, question, answer) value (?, ?, ?);';
    const insertUserCourseQuery = 'INSERT INTO user_course (user_id, course_id, completed) VALUES (?, ?, ?);';
    const findUsersQuery = 'SELECT user_id FROM user;';
    const insertUserFlashcardsQuery = 'INSERT INTO user_flashcard (flashcard_id, user_id, completed) values (?, ?, ?);';
    
    let isBanned = await dbQuery(checkIsBannedQuery, [user.id]).catch((err) => next(err));
    if(isBanned[0].banned) {
        return next(new Error('NO_PERMISSION'));
    }

    let newCourseId

    await dbQuery(insertCourseQuery, [courseName, publicAccess, ownerId, language])
        .then((result) => {
            newCourseId = result.insertId;
        })
        .catch((err) => next(err));

    let newFlashcardsId = [];
    let images = [];

    for(let i = 0; i < flashcards.length; i++) {
        await dbQuery(insertFlashcardQuery, [newCourseId, flashcards[i].question, flashcards[i].answer])
            .then((result) => { 
                newFlashcardsId.push(result.insertId);

                if(flashcards[i].image !== null) {
                    images.push({ flashcardId: result.insertId, tmpFlashcardId: flashcards[i].flashcardId });
                }
            })
            .catch((err) => next(err));     
    }

    if(publicAccess) {
        let users = await dbQuery(findUsersQuery).catch((err) => next(err));
        for(let i = 0; i < users.length; i++) {
            await dbQuery(insertUserCourseQuery, [users[i].user_id, newCourseId, 0]).catch((err) => next(err));
        }
    }
    else {
        await dbQuery(insertUserCourseQuery, [user.id, newCourseId, 0]).catch((err) => next(err));
    } 

    for(let j = 0; j < newFlashcardsId.length; j++) {
        await dbQuery(insertUserFlashcardsQuery, [newFlashcardsId[j], user.id, 0]).catch((err) => next(err));
    }

    return res.json({ status: 'ok', images });
}

const getFlashcardsAmount = async(req, res, next) => {
    let { courseId, filter } = req.params;
    courseId = parseInt(courseId, 10);
    filter = parseInt(filter, 10);

    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const userCourseConneectionQuery = 
        `SELECT 
            user.user_id, 
            course.course_id, 
            course.owner_id
        FROM 
            user 
                INNER JOIN 
            user_course 
            ON user_course.user_id = user.user_id 
                INNER JOIN 
            course 
            ON user_course.course_id = course.course_id 
        WHERE 
            user.user_id = ? AND course.course_id = ?;`;

    let getFlashcardsAmountQuery;
    
    if(filter === 0) {
        getFlashcardsAmountQuery = 
            `SELECT 
                user.user_id,
                user_flashcard.completed,
                SUM(IF(user_flashcard.completed = 0, 1, 0)) AS amount
            FROM
                user
                    INNER JOIN user_flashcard
                ON user.user_id = user_flashcard.user_id
                    INNER JOIN flashcard
                ON user_flashcard.flashcard_id = flashcard.flashcard_id
            WHERE 
                flashcard.course_id = ? AND user.user_id = ?;`;
    }
    else if(filter === 1) {
        getFlashcardsAmountQuery = 
            `SELECT 
                user.user_id,
                user_flashcard.completed,
                SUM(IF(user_flashcard.completed = 1, 1, 0)) AS amount
            FROM
                user
                    INNER JOIN user_flashcard
                ON user.user_id = user_flashcard.user_id
                    INNER JOIN flashcard
                ON user_flashcard.flashcard_id = flashcard.flashcard_id
            WHERE 
                flashcard.course_id = ? AND user.user_id = ?;`;
    }
    else if(filter === 2) {
        getFlashcardsAmountQuery = 'SELECT COUNT(flashcard_id) AS amount FROM flashcard WHERE course_id = ?;';
    }

    let userCourseConnection = await dbQuery(userCourseConneectionQuery, [user.id, courseId]).catch((err) => next(err));
    
    if(userCourseConnection.length > 0) {
        let variables = [];

        if(filter === 2) {
            variables.push(courseId);
        }
        else {
            variables.push(courseId, user.id);
        }

        let flashcardsAmount = await dbQuery(getFlashcardsAmountQuery, variables).catch((err) => next(err));

        return res.json({ status: 'ok', results: flashcardsAmount[0].amount });
    }

    return next(new Error('NO_PERMISSION'));
}

const getFlashcards = async(req, res, next) => {
    let { courseId, limit, filter } = req.params;
    courseId = parseInt(courseId, 10);
    limit = parseInt(limit, 10);
    filter = parseInt(filter, 10);

    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    let getFlashcardsQuery;
    
    if(filter == 0) {
        getFlashcardsQuery =
            `SELECT 
                user.user_id,
                user_flashcard.completed,
                user_flashcard.flashcard_id,
                flashcard.course_id,
                flashcard.question,
                flashcard.answer,
                image.src
            FROM
                user
                    INNER JOIN user_flashcard
                ON user.user_id = user_flashcard.user_id
                    INNER JOIN flashcard
                ON user_flashcard.flashcard_id = flashcard.flashcard_id
                    LEFT JOIN image
	            ON user_flashcard.flashcard_id = image.flashcard_id
            WHERE 
                user.user_id = ? AND flashcard.course_id = ? AND user_flashcard.completed = 0 LIMIT ?;`;
    }
    else if(filter === 1) {
        getFlashcardsQuery =
            `SELECT 
                user.user_id,
                user_flashcard.completed,
                user_flashcard.flashcard_id,
                flashcard.course_id,
                flashcard.question,
                flashcard.answer,
                image.src
            FROM
                user
                    INNER JOIN user_flashcard
                ON user.user_id = user_flashcard.user_id
                    INNER JOIN flashcard
                ON user_flashcard.flashcard_id = flashcard.flashcard_id
                    LEFT JOIN image
                ON user_flashcard.flashcard_id = image.flashcard_id
            WHERE 
                user.user_id = ? AND flashcard.course_id = ? AND user_flashcard.completed = 1 
            ORDER BY RAND() LIMIT ?;`;
    }
    else if(filter === 2) {
        getFlashcardsQuery = 
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
            WHERE course_id = ? LIMIT ?;`;
    }

    let variables = [];
    if(filter == 0 || filter === 1) {
        variables.push(user.id, courseId, limit);
    }
    else {
        variables.push(courseId, limit);
    }

    let results = await dbQuery(getFlashcardsQuery, variables).catch((err) => next(err));
    return res.json({ status: 'ok', results });
}

const setFlashcardsCompleted = async(req, res, next) => {
    let { flashcards } = req.body;
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const courseId = flashcards[0].course_id;

    const insertUserFlashcardsQuery = 'INSERT INTO user_flashcard (flashcard_id, user_id, completed) VALUES (?, ?, ?);';
    const findUsersFlashcardQuery = 
        `SELECT 
            user_flashcard.user_id 
        FROM 
            user_flashcard
                INNER JOIN flashcard
            ON user_flashcard.flashcard_id = flashcard.flashcard_id 
        WHERE flashcard.course_id = ? AND user_flashcard.user_id = ?
        GROUP BY user_flashcard.user_id;`;
    const findFlashcardsId = 'SELECT flashcard_id FROM flashcard WHERE course_id = ?;';
    const setFlashcardsCompletedQuery = 'UPDATE user_flashcard SET completed = 1 WHERE flashcard_id = ? AND user_id = ? AND completed = 0;';
    const checkCompletedCourseQuery = 
        `SELECT 
            SUM(IF(user_flashcard.completed = 0, 1, 0)) AS uncompleted_flashcards
        FROM
            user
                INNER JOIN user_flashcard
            ON user.user_id = user_flashcard.user_id
                INNER JOIN flashcard
            ON user_flashcard.flashcard_id = flashcard.flashcard_id
        WHERE 
            user.user_id = ? AND flashcard.course_id = ?;`;
    const setCourseCompletedQuery = 'UPDATE user_course SET completed = 1 WHERE course_id = ? AND user_id = ?;';


    let isUserFlashcard = [];
    isUserFlashcard = await dbQuery(findUsersFlashcardQuery, [courseId, user.id]).catch((err) => next(err));

    if(!isUserFlashcard.length > 0) {
        let flashcardsId = await dbQuery(findFlashcardsId, [courseId]).catch((err) => next(err));

        for(let i = 0; i < flashcardsId.length; i++) {
            await dbQuery(insertUserFlashcardsQuery, [flashcardsId[i].flashcard_id, user.id, 0]).catch((err) => next(err));
        }
    }

    for(let i = 0; i < flashcards.length; i++) {
        await dbQuery(setFlashcardsCompletedQuery, [flashcards[i].flashcard_id, user.id]).catch((err) => next(err));
    }

    let checkCompletedCourse = await dbQuery(checkCompletedCourseQuery, [user.id, courseId]).catch((err) => next(err));

    if(checkCompletedCourse[0].uncompleted_flashcards === 0) {
        await dbQuery(setCourseCompletedQuery, [courseId, user.id]).catch((err) => next(err));
    }

    res.json({ status: 'ok' });
}

const resetFlashcardsCompleted = async(req, res, next) => {
    let { courseId } = req.body;

    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const resetFlashcardsCompletedQuery = 
        `UPDATE user_flashcard  
            INNER JOIN
                flashcard 
            ON user_flashcard.flashcard_id = flashcard.flashcard_id
            SET completed = 0
        WHERE user_flashcard.user_id = ? AND flashcard.course_id = ? AND user_flashcard.completed = 1;`;

    const resetCourseCompletedQuery = 'UPDATE user_course SET completed = 0 WHERE user_id = ? AND course_id = ?';

    await dbQuery(resetFlashcardsCompletedQuery, [user.id, courseId]).catch((err) => next(err));
    await dbQuery(resetCourseCompletedQuery, [user.id, courseId]).catch((err) => next(err));

    return res.json({ status: 'ok' });
}

const uploadImage = async(req, res, next) => {        
    const insertImageQuery = 'INSERT INTO image (flashcard_id, src) VALUES (?, ?);';
    const checkIsImageExistQuery = 'SELECT src FROM image WHERE flashcard_id = ?;';
    const updateImageQuery = 'UPDATE image SET src = ? WHERE flashcard_id = ?;';

    let imageUrl;
    let flashcard;

    try {
        await upload(req, res);

        let { flashcardId } = req.body;
        flashcard = flashcardId;
        imageUrl = req.file.destination + '/' +  req.file.filename;

        let isImage = await dbQuery(checkIsImageExistQuery, flashcardId).catch((err) => next(err));

        if(isImage.length > 0) {            
            try {
                await fs.unlink(isImage[0].src);
            }
            catch(err) {
                return next(new Error(err.message));
            }
            
            await dbQuery(updateImageQuery, [imageUrl, flashcardId]);

            return res.json({ status: 'ok', image: { imageUrl, flashcardId: flashcard }});
        }

        await dbQuery(insertImageQuery, [flashcardId, imageUrl]).catch((err) => next(err));
    }
    catch(err) {
        return next(new Error(err.message));
    }

    return res.json({ status: 'ok', image: { imageUrl, flashcardId: flashcard }});
}

const getImages = async(req, res, next) => {
   let { courseId } = req.params;
   courseId = parseInt(courseId, 10);
   const getImagesQuery = 
    `SELECT 
        image.flashcard_id, image.src, flashcard.course_id
    FROM
        image
            INNER JOIN
        flashcard ON flashcard.flashcard_id = image.flashcard_id
    WHERE
        flashcard.course_id = ?;`;

    let images = await dbQuery(getImagesQuery, [courseId]).catch((err) => next(err));

    if(images.length > 0) {
        return res.json({ status: 'ok', results: images });
    }
    else {
        return res.json({ status: 'ok', results: [] });
    }
}

const deleteImage = async(req, res, next) => {
    let { flashcardId } = req.params;
    flashcardId = parseInt(flashcardId, 10);

    const findImageSrcQuery = 'SELECT src FROM image WHERE flashcard_id = ?;';
    const deleteImageQuery = 'DELETE FROM image WHERE flashcard_id = ?;';

    let image = await dbQuery(findImageSrcQuery, [flashcardId]).catch((err) => next(err));

    await dbQuery(deleteImageQuery, [flashcardId]).catch((err) => next(err));

    try {
        await fs.unlink(image[0].src);
    }
    catch(err) {
        return next(new Error(err.message));
    }

    return res.json({ status: 'ok' });
}

const checkUserPermissions = async(courseId, userId) => {
    const courseowner_idQuery = 
        `SELECT 
            user.user_id,
            course.course_id,
            course.owner_id,
            user_course.course_id
        FROM
            user
                INNER JOIN
            user_course ON user_course.user_id = user.user_id
                INNER JOIN
            course ON user_course.course_id = course.course_id
        WHERE
            user.user_id = course.owner_id AND course.course_id = ? AND user.user_id = ?;`;

    return dbQuery(courseowner_idQuery, [courseId, userId]);
}


module.exports = {
    getCourses,
    getCourse,
    getCourseName,
    updateCourseName,
    updateCourseLanguage,
    deleteFlashcard,
    deleteCourse,
    updateCourseAccess,
    updateFlashcards,
    insertFlashcards,
    createCourse,
    getFlashcardsAmount,
    getFlashcards,
    setFlashcardsCompleted,
    resetFlashcardsCompleted,
    uploadImage,
    getImages,
    deleteImage
}