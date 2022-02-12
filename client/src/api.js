import axios from 'axios';

const API_HOST = '/api';

const errors = new Map([
    ['UNDEFINED_ERROR', 'Nieznany błąd.'],
    ['USER_DOES_NOT_EXIST', 'Użytkownik nie istnieje.'],
    ['WRONG_PASSWORD', 'Niepoprawne hasło.'],
    ['USERNAME_EXIST', 'Użytkownik o tym loginie już istnieje.'],
    ['COURSE_NOT_FOUND', 'Nie znaleziono kursu.'],
    ['COURSE_NOT_ADDED', 'Nie dodano kursów.'],
    ['NO_PERMISSION', 'Brak uprawnień.'],
    ['COURSES_NOT_FOUND', 'Nie znaleziono kursów.'],
    ['CONNECTION_FAILED', 'Brak połączenia z serwerem.'],
    ['INVALID_REQUEST', 'Nieprawidłowe żądanie.'],
    ['MAIL_DOES_NOT_EXIST', 'Użytkownik o podanym adresie mailowym nie istnieje.'],
    ['WRONG_FROMAT', 'Dopuszczalny format pliku to: .png, .jpg and .jpeg.'],
    ['AUTHENTICATION_ERROR', 'Brak autoryzacji.'],
    ['EMPTY_JWT', 'Sesja wygasła.']
]);

async function axiosSend(method, path, data = undefined) {
    const res = await axios({ method, url: API_HOST + path, data })
        .catch((err) => {
            console.error(err);
          
            throw new Error(errors.get('CONNECTION_FAILED'));
        });

    if (res.data.error) {
        console.error(res.data.error);

        throw new Error(errors.has(res.data.error) ? errors.get(res.data.error) : errors.get('UNDEFINED_ERROR'));
        
    }
    else return res.data;
}

async function axiosPost(path, data) {
    return axiosSend('post', path, data);
}

async function axiosGet(path) {
    return axiosSend('get', path);
}

async function axiosDelete(path) {
    return axiosSend('delete', path);
}

async function axiosPut(path, data) {
    return axiosSend('put', path, data);
}

export async function login(username, password) {
    return axiosPost('/user/login', { username, password });
}

export async function register(username, password, mail) {
    return axiosPost('/user/register', { username, password, mail });
}

export async function logout() {
    return axiosGet('/user/logout');
}

export async function getUserInfo() {
    return axiosGet('/user/info');
}

export async function getMail(userId) {
    return axiosGet('/user/mail/' + userId);
}

export async function checkUserAccess(courseId) {
    return axiosGet('/user/check-permissions/' + courseId);
}

export async function getCourses(type, language) {
    return axiosGet('/course/courses/' + type + '/' + language);
}

export async function getCourse(courseId, modify = 0) {
    return axiosGet('/course/' + courseId + '/' + modify);
}

export async function updateCourseName(courseId, courseName) {
    return axiosPut('/course/update-course-name', { courseId, courseName });
}

export async function updateCourseLanguage(courseId, language) {
    return axiosPut('/course/update-course-language', { courseId, language });
}

export async function deleteCourse(courseId) {
    return axiosDelete('/course/delete-course/' + courseId)
}

export async function deleteFlashcard(flashcardId) {
    return axiosDelete('/course/delete/flashcard/' + flashcardId)
}

export async function updateCourseAccess(courseId, publicAccess) {
    return axiosPut('/course/update-course-access', { courseId, publicAccess });
}

export async function updateFlashcards(flashcards) {
    return axiosPut('/course/update-flashcards', { flashcards });
}

export async function insertFlashcards(flashcards) {
    return axiosPost('/course/insert-flashcards', { flashcards });
}

export async function createCourse(flashcards, courseName, publicAccess, language) {
    return axiosPost('/course/create-course', { flashcards, courseName, publicAccess, language });
}

export async function getFlashcardsAmount(courseId, filter) {
    return axiosGet('/course/flashcards-amount/' + courseId + '/' + filter);
}

export async function getFlashcards(courseId, filter, limit = undefined) {
    return axiosGet('/course/flashcards/' + courseId + '/' + filter + '/' + limit);
}

export async function setFlashcardsCompleted(flashcards) {
    return axiosPut('/course/flashcards-completed', { flashcards });
}

export async function createRoom(name) {
    return axiosPost('/multiplayer/room', { name });
}

export async function getRooms() {
    return axiosGet('/multiplayer/rooms');
}

export async function getRoom(roomId) {
    return axiosGet('/multiplayer/' + roomId)
}

export async function joinRoom(roomId) {
    return axiosPost('/multiplayer/join-room', { roomId });
}

export async function leaveRoom(roomId) {
    return axiosPost('/multiplayer/leave-room', { roomId });
}

export async function updateUsername(username) {
    return axiosPost('/user/update-username', { username });
}

export async function updatePassword(oldPassword, newPassword) {
    return axiosPost('/user/update-password', { oldPassword, newPassword });
}

export async function updateMail(mail) {
    return axiosPost('/user/update-mail', { mail });
}

export async function getCompletedFlashcards() {
    return axiosGet('/user/flashcards-completed');
}

export async function getPublicCourses(language) {
    return axiosGet('/multiplayer/courses/public/' + language);
}

export async function startGame(roomId) {
    return axiosPost('/multiplayer/start-game', { roomId });
}

export async function getOpponentResult(roomId, points) {
    return axiosPost('/multiplayer/get-result', { roomId, points });
}

export async function getCourseOrderedByRandom(courseId, roomId) {
    return axiosGet('/multiplayer/get-course-ordered-by-random/' + courseId + '/' + roomId);
}

export async function refreshRoom(roomId) {
    return axiosPost('/multiplayer/refresh-room', { roomId });
}

export async function remindPassword(mail) {
    return axiosPost('/user/remind-password', { mail });
}

export async function getPoints() {
    return axiosGet('/multiplayer/game/get-points');
}

export async function updatePoints(points) {
    return axiosPut('/multiplayer/update-points', { points });
}

export async function getGameMode(roomId, gameMode) {
    return axiosPost('/multiplayer/game-mode', { roomId, gameMode });
}

export async function getGameCourse(roomId, courseId, courseName) {
    return axiosPost('/multiplayer/game-course', { roomId, courseId, courseName });
}

export async function getPlayers() {
    return axiosGet('/multiplayer/game/invite-user');
}

export async function sendInvitation(roomId, playerId) {
    return axiosPost('/multiplayer/send-invitation', { roomId, playerId });
}

export async function kickPlayer(roomId, playerId) {
    return axiosPost('/multiplayer/kick-player', { roomId, playerId });
}

export async function getGameTime(roomId, gameTime) {
    return axiosPost('/multiplayer/game-time', { roomId, gameTime });
}

export async function getGameLanguage(roomId, gameLanguage) {
    return axiosPost('/multiplayer/game-language', { roomId, gameLanguage });
}

export async function resetFlashcardsCompleted(courseId) {
    return axiosPut('/course/flashcards-reset-completed', { courseId });
}

export async function getUsers() {
    return axiosGet('/user/get-users');
}

export async function banUser(userId) {
    return axiosPut('/user/ban-user', { userId });
}

export async function getUserBan() {
    return axiosGet('/user/get-banned');
}

export async function deleteUser(userId) {
    return axiosDelete('/user/delete-user/' + userId);
}

export async function updateSomebodyUsername(username, userId) {
    return axiosPut('/user/update-sb-username', { username, userId});
}

export async function uploadImage(image) {
    return axiosPost('/course/upload-image',  image);
}

export async function getImages(courseId) {
    return axiosGet('/course/images/' + courseId);
}

export async function deleteImage(flashcardId) {
    return axiosDelete('/course/delete-image/' + flashcardId);
}

export async function refreshToken() {
    return axiosGet('/user/token');
}