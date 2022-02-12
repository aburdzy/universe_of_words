import React, { useState, useEffect } from 'react';
import * as api from '../../api';
import Loader from '../Loader/Loader';
import styles from './ManageUsers.module.css';
import { faTrash, faPen, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cogoToast from 'cogo-toast';
import Modal from '../Modal/Modal';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalHeader, setModalHeader] = useState('');
    const modalTexts = ['Czy na pewno chcesz zablokować możliwość dodawania kursów?', 
    'Zmiana nazwy użytkownika', 'Czy na pewno chcesz usunąć użytkownika?'];
    const [userId, setUserId] = useState(-1);
    const [username, setUsername] = useState('');

    useEffect(() => {
        api.getUsers()
            .then((res) =>{
                setUsers(res.results);
                setLoading(false);
            })
            .catch((err) => cogoToast.error(err.message));
    }, []);

    function setModal(userId) {
        setModalVisible(true);
        setUserId(userId);
    }

    function banUserSettings(userId) {
        setModal(userId);
        setModalHeader(modalTexts[0]);        
    }
    
    function editUserSettings(userId) {
        setModal(userId);
        setModalHeader(modalTexts[1]);
    }

    function deleteUserSettings(userId) {
        setModal(userId);
        setModalHeader(modalTexts[2]);
    }

    function banUser() {
        // setModalVisible(false);

        api.banUser(userId)
            .then(() => {
                cogoToast.success('Zablokowano możliwość tworzenia kursów.');

                let index = users.findIndex((user) => user.user_id === userId);
                console.log(index);
        
                let tmpUsers = [...users];
                console.log(users[index].banned = 1);
        
                setUsers(tmpUsers);
                setUserId(-1);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function editUser() {
        setModalVisible(false);
        
        api.updateSomebodyUsername(username, userId)
            .then(() => {
                let tmpUsers = [...users];
                let index = tmpUsers.findIndex((user) => user.user_id === userId);
                tmpUsers[index].username = username;

                setUsers(tmpUsers);
                setUsername('');

                cogoToast.success('Zmieniono nazwę użytkownika.');
            })
            .catch((err) => cogoToast.error(err.message));        
    }

    function deleteUser() {
        // setModalVisible(false);

        api.deleteUser(userId)
            .then(() => {                
                setUsers(users.filter((user) => user.user_id !== userId));

                cogoToast.success('Usunięto użytkownika.');
                setUserId(-1);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    return (
        <div className="page">
            <div className="container">
                <h1 className={styles.header}>Zarządzanie użytkownikami</h1>
                {loading ? <Loader wrapper={true} /> : 
                    users.length > 0 ? 
                        users.map((user) => {
                            return (
                                <div className={styles.tile} key={user.user_id}>
                                    <span>{user.username}</span>
                                    <div className={styles.manage}>
                                        <FontAwesomeIcon icon={faBan} color={user.banned ? 'rgba(193, 193, 193, 0.7)' : "#040759"} className={styles.ban} onClick={() => user.banned ? null : banUserSettings(user.user_id)} />
                                        <FontAwesomeIcon icon={faPen} color="#040759" className={styles.edit} onClick={() => editUserSettings(user.user_id)} />
                                        <FontAwesomeIcon icon={faTrash} color="#040759" className={styles.delete} onClick={() => deleteUserSettings(user.user_id)} />
                                    </div>
                                </div>
                            );
                        })
                    : null
                }
            </div>
            <Modal 
                isOpen={modalVisible}
                onClose={() => setModalVisible(false)}
                header={modalHeader}
                width="300px"
                save={modalHeader === modalTexts[1]}
                confirm="Tak"
                action={modalHeader === modalTexts[0] ? () => banUser() : modalHeader === modalTexts[2] ? () => deleteUser() : null}
                cancel="Nie"
            >
                {modalHeader === modalTexts[1] ? 
                    <form className={styles.form} onSubmit={(ev) => ev.preventDefault()}>
                        <input type="text" placeholder="Nazwa użytkownika" className={styles.input} value={username} onChange={(ev) => setUsername(ev.target.value)} />
                        <div className={styles.button}>
                            <button onClick={editUser}>Zapisz</button>
                        </div>
                    </form>
                : null}
            </Modal>
        </div>
    );
}

export default ManageUsers;
