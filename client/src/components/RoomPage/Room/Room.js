import React, { useState, useContext, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import * as styles from './Room.module.css';
import SocketContext from '../../../contexts/SocketContext';
import * as api from '../../../api';
import cogoToast from 'cogo-toast';
import PageNotFound from '../../PageNotFound/PageNotFound';
import Loader from '../../Loader/Loader';
import { UserContext } from '../../../contexts/UserContext';
import ChooseMode from '../ChooseMode/ChooseMode';
import Results from '../Results/Results';
import WriteMode from '../WriteMode/WriteMode';
import Modal from '../../Modal/Modal';
import GameSettingsForOpponent from '../GameSettingsForOpponent/GameSettingsForOpponent';
import GameSettingsForHost from '../GameSettingsForHost/GameSettingsForHost';

function Room() {
    const [user] = useContext(UserContext);
    const { socket } = useContext(SocketContext);

    const [room, setRoom] = useState({});
    const { roomId } = useParams();

    const [loading, setLoading] = useState(true);
    const [isRoomExist, setIsRoomExist] = useState();

    const [gameTime, setGameTime] = useState(0);
    const times = [5, 10, 15];
    const [gameMode, setGameMode] = useState(0);
    const gameModeTexts = ['Wyścigi', 'Wpisywanie', 'Wybieranie'];
    const hints = ['Rozgrywka polega na odpowiedzi na jak największą liczbę pytań przed upływem czasu.', 
                   'Rozgrywka polega na wpisywaniu odpowiedzi na zadawane pytania.', 
                   'Rozgrywka polega na wyborze 1 spośród 4 odpowiedzi w odpowiednim czasie.'];
    const [selectedCourse, setSelectedCourse] = useState();
    const [courses, setCourses] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState();

    const [flashcards, setFlashcards] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [index, setIndex] = useState(0);
    const [userPoints, setUserPoints] = useState([]);

    const [opponentResults, setOpponentResults] = useState({});

    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isGameFinished, setIsGameFinished] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [players, setPlayers] = useState([]);
    const [isLoadingPlayers, setLoadingPlayers] = useState(true);

    const { id: userId } = user;

    const history = useHistory();

    useEffect(() => {
        api.getRoom(roomId)
            .then((res) => {
                if(res.results === null) {
                    setIsRoomExist(false);
                    setLoading(false);
                }
                else {              
                    setIsRoomExist(true);
                    setRoom(res.results);

                    let users = res.results.users;

                    if(!users.some((row) => row.includes(userId))) {
                        history.push('/poczekalnia');
                    }
                    else {
                        setLoading(false);
                    }
                }
            })
            .catch((err) => cogoToast.error(err.message));

        window.addEventListener('beforeunload', displayWarning);

        return () => {
            window.removeEventListener('beforeunload', displayWarning);
        };
    }, []);

    useEffect(() => {
        if (!socket.connected) return;

        socket.conn.on('joined_room', onJoinedRoom);
        socket.conn.on('leave_room', onLeaveRoom);
        socket.conn.on('user_left', onUserLeft); 
        socket.conn.on('game_started', onGameStarted); 
        socket.conn.on('get_flashcards', onGetFlashcards);  
        socket.conn.on('get_result', onGetResult);
        socket.conn.on('room_refreshed', onRoomRefreshed);
        socket.conn.on('get_game_mode', onGetGameMode);
        socket.conn.on('get_game_course', onGetGameCourse);
        socket.conn.on('kick_player', onKickPlayer);
        socket.conn.on('get_game_time', onGetGameTime);
        socket.conn.on('get_game_language', onGetGameLanguage);
            
        return () => {
            socket.conn.off('joined_room', onJoinedRoom);
            socket.conn.off('leave_room', onLeaveRoom);
            socket.conn.off('user_left', onUserLeft);
            socket.conn.off('game_started', onGameStarted);
            socket.conn.off('get_flashcards', onGetFlashcards);
            socket.conn.off('get_result', onGetResult);
            socket.conn.off('room_refreshed', onRoomRefreshed);
            socket.conn.off('get_game_mode', onGetGameMode);
            socket.conn.off('get_game_course', onGetGameCourse);
            socket.conn.off('kick_player', onKickPlayer);
            socket.conn.off('get_game_time', onGetGameTime);
            socket.conn.off('get_game_language', onGetGameLanguage);
        };
    }, [socket.connected]);

    useEffect(() => {
        if(flashcards.length === index + 1) {
            getOpponentResult();
        }
    }, [index]);

    useEffect(() => {
        if(isOpen) {
            getPlayers();
        }
    }, [isOpen]);

    function onJoinedRoom(roomToChange) {
        setRoom((room) => {
            if(roomToChange.id !== room.id) {
                return { ...room };
            }
            else {
                return { ...room, users: roomToChange.users };
            }
        });

        setGameMode((gameMode) => {      
            api.getGameMode(roomId, gameMode).catch((err) => cogoToast.error(err.message));
            return gameMode;
        });

        setSelectedCourse((selectedCourse) => {
            if(selectedCourse) {
                api.getGameCourse(roomId, selectedCourse.value, selectedCourse.label).catch((err) => cogoToast.error(err.message));
            }
            
            return selectedCourse;
        });

        setGameTime((gameTime) => {
            api.getGameTime(roomId, gameTime).catch((err) => cogoToast.error(err.message));
            return gameTime;
        });

        setSelectedLanguage((selectedLanguage) => {
            if(selectedLanguage) {
                api.getGameLanguage(roomId, selectedLanguage.value).catch((err) => cogoToast.error(err.message));
            }

            return selectedLanguage
        });
    }

    function onLeaveRoom(roomToChange) {
        leaveRoom(roomToChange);
    }

    function onUserLeft(roomToChange) {
        leaveRoom(roomToChange);
    }

    function leaveRoom(roomToChange) {
        setRoom((room) => {
            if(roomToChange.id !== room.id) {
                return { ...room };
            }
            else if(roomToChange.users !== room.users) {
                return { ...room, host: roomToChange.room.host, users: roomToChange.room.users };
            }
        });
    }

    function onGameStarted() {
        setIsGameStarted(true);

        let courseId;

        setSelectedCourse((selectedCourse) => {
            courseId = selectedCourse.value;

            return selectedCourse;
        })
        getFlashcards(courseId, roomId);
    }

    function onGetResult(result) {
        setOpponentResults(result);
    }

    function onGetFlashcards(flashcards) {
        setFlashcards(flashcards);

        setAnswers(flashcards.map((result) => {
            return result.answer;
        }));
    }

    function onRoomRefreshed(roomId) {
        setIsGameStarted(false);
        setIsGameFinished(false);

        setGameTime(0);
        setGameMode(0);

        setFlashcards([]);
        setSelectedCourse(null);
        setSelectedLanguage(null);

        setAnswers([]);
        setIndex(0);

        setUserPoints([]);
        setOpponentResults({});
    }

    function onGetGameMode(gameMode) {
        setGameMode(gameMode);
    }

    function onGetGameCourse(course) {      
        setSelectedCourse({ value: course.courseId, label: course.name });
    }

    function onKickPlayer() {
        cogoToast.info('Zostałeś wyrzucony z pokoju.');
        history.push('/poczekalnia');
    }

    function onGetGameTime(gameTime) {
        setGameTime(gameTime);
    }

    function onGetGameLanguage(gameLanguage) {
        setSelectedLanguage({ value: gameLanguage, label: gameLanguage });
    }

    function displayWarning(ev) {
        ev.preventDefault();
        ev.returnValue = ' ';
    }

    function kickPlayer(playerId) {
        api.kickPlayer(roomId, playerId).catch((err) => cogoToast.error(err.message));
    }

    function handleSelectedCourseChange(selectedCourse) {
        setSelectedCourse(selectedCourse);
        api.getGameCourse(roomId, selectedCourse.value, selectedCourse.label).catch((err) => cogoToast.error(err.message));
    }

    function handleSelectedLanguage(selectedLanguage) {
        setSelectedLanguage(selectedLanguage);
        setSelectedCourse(null);

        api.getGameCourse(roomId, -1, '-').catch((err) => cogoToast.error(err.message));

        if(room.host === userId) {
            api.getPublicCourses(selectedLanguage.label)
                .then((res) => {
                    let options = res.results.map((result) => {
                        return {
                            value: result.course_id,
                            label: result.name
                        }
                    });

                    setCourses(options);
                })
                .catch((err) => cogoToast.error(err.message));
        }

        api.getGameLanguage(roomId, selectedLanguage.value).catch((err) => cogoToast.error(err.message));
    }

    function sendGameType(toggle) {        
        api.getGameMode(roomId, toggle).catch((err) => cogoToast.error(err.message));
    }

    function sendGameTime(toggle) {
        api.getGameTime(roomId, toggle).catch((err) => cogoToast.error(err.message));
    }

    function displayRoom() {
        return (
            <div>
                <h1 className={styles.name}>{room.name}</h1>
                {room.users.length > 0 ? 
                    room.users.map((user, index) => {
                        return (
                            <div className={styles.tile} key={index}>
                                {user[0] === userId ? 
                                    <span className={styles.username}>{user[1]} (ja)</span>
                                    :
                                    <span className={styles.username}>{user[1]}</span>
                                }
                                {room.host === user[0] ? <span className={styles.host}>Host</span> : null}
                                {room.host === userId && user[0] !== userId ? <span className={styles.kick} onClick={() => kickPlayer(user[0])}>Wyrzuć</span> : null}
                            </div>
                        );
                }) : null}
                {room.host === user.id && room.users.length < 2 ? <button className={styles.invite} onClick={() => setIsOpen(true)}>Zaproś gracza</button> : null}
                {room.host === user.id ? 
                    <GameSettingsForHost 
                        setGameTime={setGameTime}
                        times={times.map((time) => time + ' s')}
                        setGameMode={setGameMode}
                        sendGameType={sendGameType}
                        sendGameTime={sendGameTime}
                        gameModeTexts={gameModeTexts}
                        hints={hints}
                        selectedCourse={selectedCourse}
                        handleSelectedCourseChange={handleSelectedCourseChange}
                        courses={courses}
                        startGame={startGame}
                        selectedLanguage={selectedLanguage}
                        handleSelectedLanguage={handleSelectedLanguage}
                    />
                : 
                    <GameSettingsForOpponent 
                        gameMode={gameModeTexts[gameMode]}
                        hint={hints[gameMode]}
                        selectedCourse={selectedCourse ? selectedCourse.label : '-'}
                        selectedLanguage={selectedLanguage ? selectedLanguage.label : '-'}
                        gameTime={times[gameTime]}
                        courseId={selectedCourse ? selectedCourse.value : -1}
                    />}
            </div>
        );
    }

    function getPlayers() {
        setLoadingPlayers(true);

        api.getPlayers()
            .then((res) => { 
                setPlayers(res.results);

                setTimeout(() => {
                    setLoadingPlayers(false);
                }, 200);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function sendInvitation(playerId) {
        api.sendInvitation(roomId, playerId)
            .then(() => cogoToast.success('Zaproszenie zostało wysłane.'))
            .catch((err) => cogoToast.error(err.message));

        setIsOpen(false);
    }

    function refreshPlayerList() {
        getPlayers();
    }

    function startGame() {
        if(room.users.length < 2) {
            cogoToast.error('Brakuje jednego gracza.');
            return;
        }
        else if(selectedLanguage === undefined || selectedLanguage === null) {
            cogoToast.error('Wybierz język.');
            return;
        }
        else if(selectedCourse === undefined || selectedCourse === null) {
            cogoToast.error('Wybierz kurs.');
            return;
        }

        api.startGame(room.id)
            .catch((err) => cogoToast.error(err.message));
    }

    function getFlashcards(courseId, roomId) {
        setLoading(true);

        api.getCourseOrderedByRandom(courseId, roomId) 
            .then(() => {                
                setTimeout(() => {
                    setLoading(false);
                }, 200);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function getOpponentResult() {
        setLoading(true);

        if(userPoints.length > 0) {
            let setFlashcardsCompleted = api.setFlashcardsCompleted(userPoints);
            let updateUserPoints = api.updatePoints(userPoints.length);

            Promise.all([setFlashcardsCompleted, updateUserPoints])
                .catch((err) => cogoToast.error(err.message));
        }

        if(room.users.length === 2) {
            api.getOpponentResult(roomId, !isNaN(userPoints.length) ? userPoints.length : 0)
                .then(() => {
                    setIsGameFinished(true);

                    setTimeout(() => {
                        setLoading(false);
                    }, 200);
                })
                .catch((err) => cogoToast.error(err.message));
        }
        else {
            setIsGameFinished(true);

            setTimeout(() => {
                setLoading(false);
            }, 200);
        }
    }

    function showResults() {
        return (
            <Results 
                userPoints={userPoints.length}
                userUsername={user.username}
                opponentPoints={Object.keys(opponentResults).length > 0 ? (opponentResults.points) : 0}
                opponentUsername={Object.keys(opponentResults).length > 0  ?  opponentResults.username : room.users.length === 1 ? 'gracz opuścił pokój' : 'oczekiwanie na gracza'}
                refreshRoom={refreshRoom}
            />
        );
    }

    function refreshRoom() {
        api.refreshRoom(roomId)
            .then(() =>  {
               setRoom({ ...room, isGameInProgress: false });
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function racesMode() {
        return (
            <div className={styles.gameContainer}>
                  {flashcards.length > 0 && (flashcards.length !== index + 1) && !isGameFinished ?
                    <ChooseMode
                        answers={answers}
                        index={index}
                        setIndex={setIndex}
                        flashcards={flashcards}
                        points={userPoints}
                        setPoints={setUserPoints}
                        getOpponentResult={getOpponentResult}
                        oneRoundTime={times[gameTime]}
                        rounds={1}
                    /> 
                : isGameFinished ? showResults() : null}
            </div>
        );
    }

    function writeMode() {
        return (
            <div className={styles.gameContainer}>
                  {flashcards.length > 0 && (flashcards.length !== index + 1) && !isGameFinished ?
                    <WriteMode
                        index={index}
                        setIndex={setIndex}
                        flashcards={flashcards}
                        points={userPoints}
                        setPoints={setUserPoints}
                        getOpponentResult={getOpponentResult}
                        oneRoundTime={times[gameTime]}
                        rounds={5}
                    /> 
                : isGameFinished ? showResults() : null}
            </div>
        );
    }

    function chooseMode() {
        return (
            <div className={styles.gameContainer}>
                {flashcards.length > 0 && (flashcards.length !== index + 1) && !isGameFinished ?
                    <ChooseMode
                        answers={answers}
                        index={index}
                        setIndex={setIndex}
                        flashcards={flashcards}
                        points={userPoints}
                        setPoints={setUserPoints}
                        getOpponentResult={getOpponentResult}
                        oneRoundTime={times[gameTime]}
                        rounds={5}
                    /> 
                : isGameFinished ? showResults() : null}
            </div>
        );
    }

    function game() {
        return (
            <div>
                {gameMode === 0 ? racesMode() : gameMode === 1 ? writeMode() : gameMode === 2 ? chooseMode() : null}
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
            {loading ? <Loader /> : !isRoomExist ? <PageNotFound /> : !isGameStarted ? displayRoom() : game()}
            <Modal 
                header="Zapraszanie gracza" 
                width={'300px'} 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)}
                save={true}
            >
                {isLoadingPlayers ? 
                    <Loader wrapper={true} backgroundColor={'rgba(4, 7, 89, 0.64)'}/>
                 : 
                    <div className={styles.players}>
                        {players.length > 0 ? 
                            players.map((player) => {
                                return (
                                    <div key={player.id} className={styles.player}>
                                        <span>{player.username}</span>
                                        <button className={styles.sendInvitation} onClick={() => sendInvitation(player.id)}>Zaproś</button>
                                    </div>
                                );
                            })    
                        : <span className={styles.noPlayers}>Brak graczy</span>}
                    </div>}         
                <button className={styles.refreshList} onClick={refreshPlayerList}>Odśwież</button>
            </Modal>
            </div>
        </div>
    );
}

export default Room;