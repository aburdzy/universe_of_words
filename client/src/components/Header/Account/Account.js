import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import * as styles from './Account.module.css';
import SocketContext from '../../../contexts/SocketContext';
import * as api from '../../../api';
import cogoToast from 'cogo-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

function Account(props) {
    const history = useHistory();
    const { socket } = useContext(SocketContext);

    function handleLogout() {
        api.logout()
            .then(() => {
                props.clearUser();

                if(socket.connected) {
                    socket.disconnect();
                }

                if(document.cookie) {
                    document.cookie='token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                }
                
                history.push('/');
            })
            .catch((err) => cogoToast.error(err.message));
    }
    
    return (
        <div className={styles.dropdown}>
            <div className={styles.dropdown}>
                <div className={styles.account}>
                    <span>Moje konto</span>
                    <div className={styles.iconContainer} style={{ fontSize: '16px' }}>
                        <FontAwesomeIcon icon={faUserCircle} size="lg" color="#040759" />
                    </div>
                </div>
                <div className={styles.dropdownContent}>
                    <div onClick={() => history.push('/profil')}>Profil</div>
                    <div onClick={handleLogout}>Wyloguj się</div>
                </div>
            </div>
        </div>
    )
}

export default Account;
