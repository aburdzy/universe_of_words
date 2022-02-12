import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import * as styles from './Auth.module.css';
import * as api from '../../api';
import cogoToast from 'cogo-toast';
import SocketContext from '../../contexts/SocketContext';

function Login() {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser]  = useContext(UserContext);
    const { socket } = useContext(SocketContext);

    function onChangeUsername(ev) {
        setUsername(ev.target.value);
    }

    function onChangePassword(ev) {
        setPassword(ev.target.value);
    }

    function onFormSubmit(ev) {
        ev.preventDefault();
        
        api.login(username, password)
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

    return (
        <div className="page">
            <form className={styles.form}>
                <h2>Zaloguj się</h2>
                <input type="text" placeholder="Nazwa użytkownika" value={username} onChange={(ev) => onChangeUsername(ev)} />
                <input type="password" placeholder="Hasło" autoComplete="on" value={password} onChange={(ev) => onChangePassword(ev)} />
                <button className={styles.submit} type="submit" onClick={(ev) => onFormSubmit(ev)}>Zaloguj się</button>
                <div className={styles.links}>
                    <Link to="/przypomnienie-hasla" target="_blank">Zapomniałeś hasła?</Link>
                    <Link to="/rejestracja">Zarejestruj się</Link>
                </div>
            </form>
        </div>
    );
}

export default Login;

