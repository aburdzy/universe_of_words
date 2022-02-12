import React, { useState, useContext, useEffect } from 'react';
import * as styles from './Profile.module.css';
import cogoToast from 'cogo-toast';
import { UserContext } from '../../contexts/UserContext';
import * as api from '../../api';
import Modal from '../Modal/Modal';
import Loader from '../Loader/Loader';

function Profile() {
    const [user, setUser] = useContext(UserContext);
    const [completedFlashcards, setCompletedFlashcards] = useState(0);
    
    const [username, setUsername] = useState('');
    const [currentMail, setCurrentMail] = useState('');
    const [newMail, setNewMail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [usernameModalVisible, setUsernameModalVisible] = useState(false);
    const [mailModalVisible, setMailModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    const [points, setPoints] = useState(0);

    useEffect(() => {
        let getCompletedFlashcards = api.getCompletedFlashcards()
            .then((res) => setCompletedFlashcards(res.results));

        let getMail = api.getMail(user.id)
            .then((res) => setCurrentMail(res.result));

        let getPoints = api.getPoints()
            .then((res) => setPoints(res.result));

        Promise.all([getCompletedFlashcards, getMail, getPoints])
            .then(() => setLoading(false))
            .catch((err) => cogoToast.error(err.message));
    }, []);

    function showUsernameModal() {
        setIsEditing(true);
        setUsernameModalVisible(true);
    }

    function showPasswordModal() {
        setIsEditing(true);
        setPasswordModalVisible(true);
    }

    function showMailModal() {
        setIsEditing(true);
        setMailModalVisible(true);
    }

    function closePasswordModal() {
        setIsEditing(false); 
        setPasswordModalVisible(false);
    }

    function closeMailModal() {
        setIsEditing(false); 
        setMailModalVisible(false);
    }

    function closeUsernameModal() {
        setIsEditing(false); 
        setUsernameModalVisible(false);
    }

    function updatePassword() {
        closePasswordModal();

        if(currentPassword === '' || newPassword === '' || currentPassword === undefined || newPassword === undefined) {
            cogoToast.error('Wypełnij wszystkie pola.');
        }
        else {
            api.updatePassword(currentPassword, newPassword)
                .then(() => {
                    cogoToast.success('Hasło zostało zmienione.');
                })
                .catch((err) => cogoToast.error(err.message));
        }

        setCurrentPassword('');
        setNewPassword('');
    }

    function updateUsername() {
        setUsernameModalVisible(false);

        if(username === user.username) {
            setIsEditing(false);
        }
        else if(username === '') {
            cogoToast.error('Nazwa użytkownika nie może być pusta.');
            setIsEditing(false);
        }
        else {
            api.updateUsername(username)
                .then(() => {
                    setUser({ ...user, username });
                    cogoToast.success('Nazwa użytkownika została zmieniona.');
                })
                .catch((err) => cogoToast.error(err.message));

            setIsEditing(false);
        }

        setUsername('');
    }

    function updateMail() {
        setMailModalVisible(false);

        if(currentMail === newMail) {
            setIsEditing(false);
        }
        else if(!newMail.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
            cogoToast.error('Wprowadź poprawny adres mailowy.');
            setIsEditing(false);
        }
        else if(newMail === '') {
            cogoToast.error('Adres mailowy nie może być pusty.');
            setIsEditing(false);
        }
        else {
            api.updateMail(newMail)
                .then((res) => {
                    setCurrentMail(newMail);
                    cogoToast.success('Adres mailowy został zmieniony.');
                })
                .catch((err) => cogoToast.error(err.message));

            setIsEditing(false);
        }

        setNewMail('');
    }

    return (
        <div className="page">
            {loading ? <Loader /> : 
                <div className="container">
                    <h1 className={styles.name}>Profil</h1>
                    <div className={styles.tile}>
                        <span>Zapamiętane fiszki: {completedFlashcards}</span>
                    </div>
                    <div className={styles.tile}>
                        <span>Punkty zdobyte w rozgrywce: {points}</span>
                    </div>
                    <div className={styles.tile}>
                        <div className={styles.data}>
                            <span>nazwa użytkownika:</span>
                            <span>{user.username}</span>
                        </div>
                        <button onClick={!isEditing ? () => showUsernameModal() : null}>Edytuj</button>
                    </div>
                    <div className={styles.tile}>
                        <div className={styles.data}>
                            <span>adres mailowy:</span>
                            <span>{currentMail}</span>
                        </div>
                        <button onClick={!isEditing ? () => showMailModal() : null}>Edytuj</button>
                    </div>
                    <div className={styles.tile}>
                        <div className={styles.data}>
                            <span>hasło:</span>
                            <span>****</span>
                        </div>
                        <button onClick={!isEditing ? () => showPasswordModal() : null}>Edytuj</button>
                    </div>
                </div>
            }
                <Modal 
                    isOpen={usernameModalVisible}
                    onClose={closeUsernameModal}
                    header="Zmiana nazwy użytkownika"
                    save={true}
                >
                    <form className={styles.modalForm} onSubmit={(ev) => ev.preventDefault()}>
                        <input type="text" className={styles.modalInput} placeholder="Nazwa użytkownika" onChange={(ev) => setUsername(ev.target.value)} defaultValue={user.username}></input>
                        <button className={styles.save} onClick={updateUsername}>Zapisz</button>
                    </form>
                </Modal>
                <Modal 
                    isOpen={mailModalVisible}
                    onClose={closeMailModal}
                    header="Zmiana adresu mailowego"
                    save={true}
                >
                    <form className={styles.modalForm} onSubmit={(ev) => ev.preventDefault()}>
                        <input type="text" className={styles.modalInput} placeholder="Adres mailowy" onChange={(ev) => setNewMail(ev.target.value)} defaultValue={currentMail}></input>
                        <button className={styles.save} onClick={updateMail}>Zapisz</button>
                    </form>
                </Modal>
                <Modal 
                    isOpen={passwordModalVisible}
                    onClose={closePasswordModal}
                    header="Zmiana hasła"
                    save={true}
                >
                    <form className={styles.modalForm} onSubmit={(ev) => ev.preventDefault()}>
                        <div className={styles.inputContainer}>
                            <input type="password" autoComplete="off" placeholder="Poprzednie hasło" onChange={(ev) => setCurrentPassword(ev.target.value)}></input>
                            <input type="password" autoComplete="off" placeholder="Nowe hasło" onChange={(ev) => setNewPassword(ev.target.value)}></input>
                        </div>
                        <button className={styles.save} onClick={updatePassword}>Zapisz</button>
                    </form>
                </Modal>
        </div>
    );
}

export default Profile;
