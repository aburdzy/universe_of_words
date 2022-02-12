import React, { useEffect, useContext } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import * as styles from './Header.module.css';
import { UserContext } from '../../contexts/UserContext';
import Account from './Account/Account';
import * as api from '../../api';
import cogoToast from 'cogo-toast';
import SocketContext from '../../contexts/SocketContext';

function Header() {
    const location = useLocation();
    const history  = useHistory();
    const [user, setUser]  = useContext(UserContext);
    const { socket } = useContext(SocketContext);

    useEffect(() => {
        let logged = document.cookie.includes('token=');

        if(logged) {
            let getUserInfo = api.getUserInfo();
            let getUserBan = api.getUserBan();

            Promise.all([getUserInfo, getUserBan])
                .then((res) => setUser({...user, id: res[0].user.id, username: res[0].user.username, logged: 1, banned: res[1].banned }))
                .catch((err) => cogoToast.error(err.message));
        }
    }, []);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
            return;
        }

        socket.conn.on('logout', onLogout);

        return () => {
            socket.conn.off('logout', onLogout);
        };
    }, [socket.connected]);

    useEffect(() => {
        if(!location.pathname.includes('/match')) {
            if(user.roomId !== -1 && document.cookie.includes('token=')) {
                api.leaveRoom(user.roomId)
                    .then(() => setUser({ ...user, roomId: -1 }))
                    .catch((err) => cogoToast.error(err.message));  
            }
        }
    }, [location.pathname]);

    function clearUser() {
        setUser({ id: -1, username: '', logged: 0, roomId: -1 });
    }

    function onLogout(data) {
        api.logout()
            .then(() => {
                clearUser(); 
                
                if(socket.connected) {
                    socket.disconnect();
                }

                if(document.cookie) {
                    document.cookie='token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                }

                history.push('/');
                cogoToast.info(data);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    return (
        <div className={styles.header}>
            <div className={styles.logoContainer} onClick={() => history.push('/kursy')}>
                <div className={styles.logo}></div>
                <h3 className={styles.name}>Universe of Words</h3>
            </div>
            {(location.pathname === '/' && !user.logged) ? 
                <div className={styles.sign}>
                    <Link to="/logowanie">Zaloguj</Link>
                    <Link to="/rejestracja">Zarejestruj</Link>
                </div>
                : (location.pathname !== '/' && user.logged) ?
                    <Account clearUser={clearUser} />
                : null}
        </div>
    )
}

export default Header;
