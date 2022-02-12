import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import * as styles from './Auth.module.css';
import * as api from '../../api';
import cogoToast from 'cogo-toast';
import SocketContext from '../../contexts/SocketContext';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [passwordInfo, setPasswordInfo] = useState('');
    const [user, setUser]  = useContext(UserContext);
    const { socket } = useContext(SocketContext);
    const [mail, setMail] = useState('');

    const history = useHistory();

    function onChangeUsername(ev) {
        setUsername(ev.target.value);
    }

    function onChangePassword(ev) {
        let password = ev.target.value;
        setPassword(password);

        if (password === passwordRepeat) {
            setPasswordInfo('');
            document.querySelector('.password-repeat').classList.remove('incorrect');
        }
        else {
            setPasswordInfo('Hasła różnią się');
            document.querySelector('.password-repeat').classList.add('incorrect');
        }
    }

    function onChangeMail(ev) {
        setMail(ev.target.value);
    }

    function onChangePasswordRepeat(ev) {
        let passwordRepeat = ev.target.value;
        setPasswordRepeat(passwordRepeat);

        if (password === passwordRepeat) {
            setPasswordInfo('');
            document.querySelector('.password-repeat').classList.remove('incorrect');
        }
        else {
            setPasswordInfo('Hasła różnią się');
            document.querySelector('.password-repeat').classList.add('incorrect');
        }
    }

    function onFormSubmit(ev) {
        ev.preventDefault();

        if(!mail.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
            cogoToast.error('Wprowadź poprawny adres mailowy.');
            return;
        }

        if(username && password && passwordRepeat && mail) {
            api.register(username, password, mail)
                .then((res) => {
                    if (res.status === 'logged') {
                        let getUserInfo = api.getUserInfo();
                        let getUserBan = api.getUserBan();

                        Promise.all([getUserInfo, getUserBan])
                            .then((res) => {
                                setUser({...user, id: res[0].user.id, username: res[0].user.username, logged: 1, banned: res[1].banned });
                                socket.connect();
                                history.replace('/kursy');
                            })
                            .catch((err) => cogoToast.error(err.message));
                    }
                })
                .catch((err) => cogoToast.error(err.message));
        }
        else {
            cogoToast.error('Wypełnij wszystkie pola!');
        }
    }

    return (
        <div className="page">
            <form className={styles.form}> 
                <h2>Załóż konto</h2>
                <input className={styles.mail} placeholder="Adres e-mail" type="email" value={mail} onChange={(ev) => onChangeMail(ev)} />
                <input placeholder="Nazwa użytkownika" type="text" value={username} onChange={(ev) => onChangeUsername(ev)} />
                <input placeholder="Hasło" type="password" value={password} onChange={(ev) => onChangePassword(ev)} autoComplete="off" />
                <input placeholder="Powtórz hasło" type="password" value={passwordRepeat} className="password-repeat" onChange={(ev) => onChangePasswordRepeat(ev)} autoComplete="off" />
                <p className={styles.passwordInfo}>{passwordInfo}</p>
                <button className={styles.submit} type="submit" onClick={(ev) => onFormSubmit(ev)}>Zarejstruj się</button>
                <div className={styles.link}>
                    <Link to="/logowanie">Zaloguj się</Link>
                </div>
            </form>
        </div>
    ); 
}

export default Register;