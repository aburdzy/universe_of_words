import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router';
import * as styles from './Lobby.module.css';
import RoomView from '../RoomView/RoomView';
import SocketContext from '../../../contexts/SocketContext';
import { UserContext } from '../../../contexts/UserContext';
import * as api from '../../../api';
import cogoToast from 'cogo-toast';
import Loader from '../../Loader/Loader';

function Lobby() {
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [user, setUser] = useContext(UserContext);
    const { socket } = useContext(SocketContext);
    const history = useHistory();
    const [isSearching, setIsSearching] = useState(false);
    const [foundRooms, setFoundRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        api.getRooms()
            .then((res) => {
                setRooms(res.results);
                setTimeout(() => {
                    setLoading(false);
                }, 200);
            })
            .catch((err) => cogoToast.error(err.message));
    }, []);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
            return;
        }

        socket.conn.on('room_created', onRoomCreated);
        socket.conn.on('joined_room', onJoinedRoom);
        socket.conn.on('leave_room', onLeaveRoom);
        socket.conn.on('user_left', onUserLeft);
        socket.conn.on('game_in_progress', onGameInProgress);
        socket.conn.on('room_refreshed', onRoomRefreshed);
        socket.conn.on('get_invitation', onGetInvitation);
        socket.conn.on('kick_player', onKickPlayer);

        return () => {
            socket.conn.off('room_created', onRoomCreated);
            socket.conn.off('joined_room', onJoinedRoom);
            socket.conn.off('leave_room', onLeaveRoom);
            socket.conn.off('user_left', onUserLeft);
            socket.conn.off('game_in_progress', onGameInProgress);
            socket.conn.off('room_refreshed', onRoomRefreshed);
            socket.conn.off('get_invitation', onGetInvitation);
            socket.conn.off('kick_player', onKickPlayer);
        };
    }, [socket.connected]);

    function onRoomCreated(room) {
        setRooms((rooms) => [...rooms, room]);
    }

    function onJoinedRoom(room) {        
        setRooms((rooms) => {
            let index = rooms.findIndex(({ id }) => id === room.id);
            let tmpRooms = [...rooms];
            tmpRooms[index] = room;

            return tmpRooms;
        });
    }

    function onUserLeft(roomToChange) {
        leaveRoom(roomToChange);
    }

    function onLeaveRoom(roomToChange) {
        leaveRoom(roomToChange);
    }

    function leaveRoom(roomToChange) {
        if(roomToChange.room === null) {
            setRooms((rooms) => {
                let tmpRooms = [...rooms];
                tmpRooms.splice(rooms.findIndex(({ id }) => id === roomToChange.id), 1);

                return tmpRooms;
            });
        }
        else {
            setRooms((rooms) => {
                let tmpRooms = [...rooms];
                let index = rooms.findIndex(({ id }) => id === roomToChange.id);
                tmpRooms[index] = roomToChange.room;

                return tmpRooms;
            });
        }
    }

    function onGameInProgress(roomId) {
        setRooms((rooms) => {
            let tmpRooms = [...rooms];
            let index = tmpRooms.findIndex(({ id }) => id === roomId);
            tmpRooms[index] = { ...rooms[index], isGameInProgress: true };

            return tmpRooms;
        });
    }

    function onRoomRefreshed(roomId) {
        setRooms((rooms) => {
            let tmpRooms = [...rooms];
            let index = tmpRooms.findIndex(({ id }) => id === roomId);
            tmpRooms[index] = { ...rooms[index], isGameInProgress: false };

            return tmpRooms;
        });
    }

    function onGetInvitation(invitation) {
        const { hide } = cogoToast.info(
            <div className={styles.invitation}>
                <span>Użytkownik <b className={styles.user}>{invitation.user}</b> zaprasza do gry.</span>
                <div className={styles.buttonContainer}>
                    <button className={styles.accept} onClick={() => { 
                        hide(); 
                        acceptInvitation(invitation.room); 
                    }}>Akceptuj</button>
                    <button className={styles.dismiss} onClick={() => hide()}>Odrzuć</button>
                </div>
            </div>, { hideAfter: 0 }
        );
    }

    function onKickPlayer(roomToChange) {
        leaveRoom(roomToChange);
    }

    function acceptInvitation(roomId) {
        api.joinRoom(roomId)
            .then(() => {
                setUser({ ...user, roomId: roomId });
                history.push('/' + roomId);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function createNewRoom() {
        if(newRoomName === '') {
            cogoToast.error('Pokój musi zawierać nazwę.');
            return;
        }

        api.createRoom(newRoomName)
            .then((res) => {
                setUser({ ...user, roomId: res.results.id });
                history.push('/' + res.results.id);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function joinRoom(roomId) {
        api.joinRoom(roomId)
            .then(() => {
                setUser({ ...user, roomId: roomId });
                history.push('/' + roomId);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function searchRoom(ev) {
        let searchingValue = ev.target.value;

        if(searchingValue === '') {
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        let tmpRooms = [...rooms];
        let searchedRooms = tmpRooms.filter(( room ) => {
            return room.name.includes(searchingValue);
        });

        setFoundRooms(searchedRooms);
    }

    function displayRooms(rooms) {
        return (
            <div>
                {rooms.length > 0 ?
                    rooms.map((room) => {
                        return (
                            <RoomView 
                                key={room.id}
                                name={room.name} 
                                users={room.users}
                                joinRoom={() => { 
                                    room.users[0][0] === user.id || (room.users.length === 2 && room.users[1][0]) === user.id ? cogoToast.info('Masz otwarte przeynjamniej 2 karty.') :
                                    room.isGameInProgress ? cogoToast.info('Nie można dołączyć do pokoju, w którym trwa rozgrywka.') :
                                    room.users.length !== 2 ? joinRoom(room.id) : cogoToast.info('W pokoju może przebywać dwóch graczy.')
                                }}
                                isGameInProgress={room.isGameInProgress}
                            />
                        );
                }) : <h2 className={styles.lackOfRooms}>Brak pokoi</h2>}
            </div>
        );
    }

    return (
        <div className="page">
                <div className="container">
                    <h1 className={styles.header}>Poczekalnia</h1>
                    <form className={styles.createRoom} onSubmit={(ev) => ev.preventDefault()}>
                        <input type="text" placeholder="Nazwa pokoju" value={newRoomName} onChange={(ev) => setNewRoomName(ev.target.value)} />
                        <button className={styles.newRoom} onClick={createNewRoom}>Stwórz pokój</button>
                    </form>
                    <input type="text" className={styles.searchRoom} placeholder="Szukaj pokoju" defaultValue={''} onChange={(ev) => searchRoom(ev)}/>
                    {loading ? <Loader wrapper={true} /> : isSearching ? displayRooms(foundRooms) : displayRooms(rooms)}        
                </div>
        </div>
    );
}

export default Lobby;
