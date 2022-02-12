const jwt = require('jsonwebtoken');
const dbQuery = require('../helpers/dbQuery');
const sendMail = require('../nodemailer');

const uuid = require('uuid').v4;

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { instance: socketMgr, io } = require('../socketMgr');

function generateAccessToken(id, username) {
    return jwt.sign({ id, username }, process.env.SECRET_KEY, { expiresIn: '999 years' });
}

async function hashPassword (password) {  
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) reject(err);
        resolve(hash);
      });
    });
  
    return hashedPassword;
}

async function compereBecryptPassword(password, passwordToCompare) {
    const comparedPassword = await new Promise((resolve, reject) => {
        bcrypt.compare(password, passwordToCompare, (err, result) => {
            if (err) reject(err);
            resolve(result);
        })
    }); 

    return comparedPassword;
}

const login = async(req, res, next) => {
    let { username, password } = req.body;
    const findUsernameQuery = 'SELECT * FROM user WHERE username = ?;';

    let user = await dbQuery(findUsernameQuery, [username]).catch((err) => next(err));

    if(!user.length > 0) return next(new Error('USER_DOES_NOT_EXIST'));

    bcrypt.compare(password, user[0].password, (error, result) => {
        if(result) {
            let id = user[0].user_id;

            let token = generateAccessToken(id, username);

            res.cookie('token', token, { httpOnly: false });
            res.json({ status: 'logged' });
        }
        else {
            return next(new Error('WRONG_PASSWORD'));
        }
    });
}

const register = async(req, res, next) => {
    let { username, password, mail } = req.body;

    const findUsernameQuery = 'SELECT username FROM user WHERE username = ?;';
    const insertUserQuery = 'INSERT INTO user (username, password, mail) VALUES (?, ?, ?)';
    const findPublicCoursesQuery = 
        `SELECT 
            user.user_id, 
            course.public_access, 
            course.owner_id,
            course.course_id
        FROM 
        user 
                INNER JOIN user_course 
            ON user_course.user_id = user.user_id 
                INNER JOIN 
            course 
            ON user_course.course_id = course.course_id 
        WHERE 
            course.public_access = 1 GROUP BY course.course_id;`;
    
    const insertPublicCourseQuery = 'INSERT INTO user_course (user_id, course_id, completed) values (?, ?, ?);';

    let findUsername = await dbQuery(findUsernameQuery, [username]).catch((err) => next(err));
    
    if(findUsername.length > 0) {
        return next(new Error('USERNAME_EXIST'));
    }
    
    let hashedPassword = await hashPassword(password).catch((err) => next(err));
        if(hashedPassword.length > 0) {
            let insertUser = await dbQuery(insertUserQuery, [username, hashedPassword, mail]).catch((err) => next(err));
            let id = insertUser.insertId;

            let token = generateAccessToken(id, username);

            let publicCourses = await dbQuery(findPublicCoursesQuery).catch((err) => next(err));

            for(let i = 0; i < publicCourses.length; i++) {
                let insertPublicCourse = await dbQuery(insertPublicCourseQuery, [id, publicCourses[i].course_id, 0]).catch((err) => next(err));
                
                if(!insertPublicCourse.affectedRows > 0)  {
                    return next(new Error('COURSE_NOT_ADDED'));
                }
            }

            res.cookie('token', token, { httpOnly: false });
            return res.json({ status: 'logged' });
        }
        else {
            return res.json({ status: 'error' });
        }
}

const logout = (req, res) => {
    res.clearCookie('token', { httpOnly: false });
    return res.end();
}

const getUserInfo = (req, res) => {
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    return res.json({ user });
}

const getMail = async(req, res, next) => {
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const getUserMailQuery = 'SELECT mail FROM user WHERE user_id = ?';
    let mail = await dbQuery(getUserMailQuery, [user.id]).catch((err) => next(err));

    return res.json({ status: 'ok', result: mail[0].mail });
}

const updateUsername = async(req, res, next) => {
    let { username } = req.body;
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const changeUsernameQuery = 'UPDATE user SET username = ? WHERE user_id = ?';
    await dbQuery(changeUsernameQuery, [username, user.id]).catch((err) => next(err));

    let token = generateAccessToken(user.id, username);
    res.cookie('token', token, { httpOnly: false });

    return res.json({ status: 'ok' });
}

const updatePassword = async(req, res, next) => {
    let { oldPassword, newPassword } = req.body;
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const findUserQuery = 'SELECT user_id, password FROM user WHERE user_id = ?;';
    const updatePasswordQuery = 'UPDATE user SET password = ? WHERE user_id = ?;';

    let foundUser = await dbQuery(findUserQuery, [user.id]).catch((err) => next(err));

    if(!foundUser.length > 0) return next(new Error('USER_DOES_NOT_EXIST'));
    if(foundUser[0].user_id !== user.id) return next(new Error('CANNOT CHANGE SOBMEBODY\'S PASSWORD'));

    let comparedPassword =  await compereBecryptPassword(oldPassword, foundUser[0].password).catch((err) => next(err));

    if(comparedPassword) {
        let hashedPassword = await hashPassword(newPassword).catch((err) => next(err));

        if(hashedPassword.length > 0) {
            await dbQuery(updatePasswordQuery, [hashedPassword, user.id]).catch((err) => next(err));
            return res.json({ status: 'ok' });
        }

        return res.json({ status: 'error' });
    }
    else {
        return next(new Error('WRONG_PASSWORD'));
    }
}

const updateMail = async(req, res, next) => {
    let { mail } = req.body;
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const updateMailQuery = 'UPDATE user SET mail = ? WHERE user_id = ?';

    await dbQuery(updateMailQuery, [mail, user.id]).catch((err) => next(err));

    return res.json({ status: 'ok' });
}

const getCompletedFlashcards = async(req, res, next) => {
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    
    const getCompletedFlashcardsQuery = 'SELECT COUNT(user_flashcard_id) as flashcardsAmount FROM user_flashcard WHERE user_id = ? AND completed = 1;';

    let flashcardsAmount = await dbQuery(getCompletedFlashcardsQuery, [user.id]).catch((err) => next(err));   

    if(flashcardsAmount.length > 0) {
        return res.json({ status: 'ok', results: flashcardsAmount[0].flashcardsAmount });
    }

    return res.json({ status: 'error' });
}

const checkUserAccess = async(req, res, next) => {
    let { courseId } = req.params;
    courseId = parseInt(courseId, 10);
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

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
    
    let courseowner_id = await dbQuery(courseowner_idQuery, [courseId, user.id]).catch((err) => next(err));
    
    if(courseowner_id.length > 0) {
        return res.json({ status: 'ok' });
    }
    else {
        return next(new Error('NO_PERMISSION'));
    }
}

const remindPassword = async(req, res, next) => {
    let { mail } = req.body;

    const checkMailQuery = 'SELECT user_id FROM user WHERE mail = ?';
    const updatePasswordQuery = 'UPDATE user SET password = ? WHERE user_id = ?;';

    let userId = await dbQuery(checkMailQuery, [mail]).catch((err) => next(err));

    if(userId.length > 0) {
        const newPassword = uuid();

        let hashedPassword = await hashPassword(newPassword).catch((err) => next(err));

        if(hashedPassword.length > 0) {
            const html = `<p>Twoje hasło zostało zresetowane.</p> 
            <p>Nowe hasło to: <strong>${newPassword}</strong></p>
            <p>W celu zmiany hasła zaloguj się na stronę <a href=\"https://universe-of-words.herokuapp.com\">Universe Of Words</a> wprowadzając otrzymane hasło.</p>`;

            const text = `Twoje hasło zostało zresetowane. 
            Nowe hasło to: ${newPassword}
            W celu zmiany hasła zaloguj się na stronę "https://universe-of-words.herokuapp.com wprowadzając otrzymane hasło.`

            await dbQuery(updatePasswordQuery, [hashedPassword, userId[0].user_id]).catch((err) => next(err));

            try {
                await sendMail(mail, 'Reset hasła na Universe Of Words', text, html);
            }
            catch {
                return res.json({ status: 'ok' });
            }
            
            return res.json({ status: 'ok' });
        }
        else {
            return res.json({ status: 'error' });
        }
    }
    else {
        return next(new Error('MAIL_DOES_NOT_EXIST'));
    }
}

const getUsers = async(req, res, next) => {
    const getUsersQuery = 'SELECT user_id, username, banned FROM user WHERE user_id != 1;';

    let users = await dbQuery(getUsersQuery).catch((err) => next(err));

    if(users.length > 0) {
        return res.json({ status: 'ok', results: users });
    }
    else {
        return res.json({ status: 'ok', results: [] });
    }
}

const banUser = async(req, res, next) => {
    let { userId } = req.body;
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const banUserQuery = 'UPDATE user SET banned = 1 WHERE user_id = ?';
    const findUserMailQuery = 'SELECT mail FROM user WHERE user_id = ?';

    if(user.id === 1) {
        if(socketMgr.getSocketsByUserId(userId)) {
            socketMgr.getSocketsByUserId(userId).forEach((socket) => {
                socket.emit('logout', 'Na twoje konto została nałożona blokada tworzenia kursów.');
            });
        }

        await dbQuery(banUserQuery, [userId]).catch((err) => next(err));
        let mail = await dbQuery(findUserMailQuery, [userId]).catch((err) => next(err));
        const html = `<p>Możliwość tworzenia kursów na stronie <strong>Universe Of Words</strong> zosała zablokowana.</p>`
        const text = `Możliwość tworzenia kursów na stronie Universe Of Words zosała zablokowana.`


        try {
            await sendMail(mail[0].mail, 'Blokada dodawania kursów', text, html)
        }
        catch {
            return res.json({ status: 'ok' });
        }

        return res.json({ status: 'ok' });
    }
    else {
        return next(new Error('NO_PERMISSION'));
    }
}

const getUserBan = async(req, res, next) => {
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    const getUserBanQuery = 'SELECT banned FROM user WHERE user_id = ?';

    let isBanned = await dbQuery(getUserBanQuery, [user.id]);

    return res.json({ status: 'ok', banned: isBanned[0].banned });
}

const deleteUser = async(req, res, next) => {
    let { userId } = req.params;
    userId = parseInt(userId, 10);

    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const deleteUserFlashcardsQuery = 'DELETE FROM user_flashcard WHERE user_id = ?;';
    const deleteUserCourseQuery = 'DELETE FROM user_course WHERE user_id = ?;';
    const deleteUserQuery = 'DELETE FROM user WHERE user_id = ?;';
    const findUserMailQuery = 'SELECT mail FROM user WHERE user_id = ?;';

   if(user.id === 1) {
        if(socketMgr.getSocketsByUserId(userId)) {
            socketMgr.getSocketsByUserId(userId).forEach((socket) => {
                socket.emit('logout', 'Twoje konto zostało usunięte.');
            });
        }

        await dbQuery(deleteUserFlashcardsQuery, [userId]).catch((err) => next(err));
        await dbQuery(deleteUserCourseQuery, [userId]).catch((err) => next(err));
       
        let mail = await dbQuery(findUserMailQuery, [userId]).catch((err) => next(err));
        const html = `<p>Twoje konto na stronie <strong>Universe Of Words</strong> zostało usunięte.</p>`;
        const text = `Twoje konto na stronie Universe Of Words zostało usunięte.`;

        await sendMail(mail[0].mail, 'Informacja o usunięciu konta', text, html).catch((err) => next(err));
        await dbQuery(deleteUserQuery, [userId]).catch((err) => next(err));

        return res.json({ status: 'ok' });
    }
    else {
        return next(new Error('NO_PERMISSION'));
    }
}

const updateSomebodyUsername = async(req, res, next) => {
    let { username, userId } = req.body;
    let user = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    const changeUsernameQuery = 'UPDATE user SET username = ? WHERE user_id = ?';
    const findUserMailQuery = 'SELECT mail FROM user WHERE user_id = ?;';

    if(user.id === 1) {
        if(socketMgr.getSocketsByUserId(userId)) {
            socketMgr.getSocketsByUserId(userId).forEach((socket) => {
                socket.emit('logout', 'Nazwa użytkownika została zmieniona. Sprawdź szczegóły w mailu.');
            });
        }

        await dbQuery(changeUsernameQuery, [username, userId]).catch((err) => next(err));

        let mail = await dbQuery(findUserMailQuery, [userId]).catch((err) => next(err));
        const html = `<p>Twoje nazwa użtykownika na stronie <strong>Universe Of Words</strong> została zmieniona na <strong>${username}<strong></p>
        <p>W celu ponownego zalogowania użyj nowej nazwy użytkownika.</p>
        <p>Hasło pozostaje bez zmian.</p>`;
        const text = `Twoje nazwa użtykownika na stronie Universe Of Words została zmieniona na ${username} W celu ponownego zalogowania użyj nowej nazy użytkownika. Hasło pozostaje bez zmian.`;

        await sendMail(mail[0].mail, 'Zmiana nazwy użytkownika', text, html).catch((err) => next(err));

        return res.json({ status: 'ok' });
    }
    else {
        return next(new Error('NO_PERMISSION'));
    }
}

module.exports = {
    login,
    register,
    logout,
    getUserInfo,
    getMail,
    checkUserAccess,
    updateUsername,
    updatePassword,
    updateMail,
    getCompletedFlashcards,
    remindPassword,
    getUsers,
    banUser,
    getUserBan,
    deleteUser,
    updateSomebodyUsername
}