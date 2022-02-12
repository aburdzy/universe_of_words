import React from 'react';
import * as styles from  './RoomView.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';

function RoomView(props) {
    return (
        <div className={styles.room} onClick={props.joinRoom}>
            <div className={styles.container}>
                <h3 className={styles.name}>{props.name}</h3>
                <div className={styles.userContainer}>
                    {props.users.length && props.users.length > 0 ? 
                        props.users.map((user, index) => {
                            return (
                                <span key={index} className={styles.username}>{user[1]}</span>
                            );
                        })
                    : null}
                </div>
            </div>
            {props.isGameInProgress ? <p className={styles.gameInProgress}>w toku</p> : null}
            <FontAwesomeIcon icon={faUserFriends} className={styles.icon} size="2x" />
        </div>
    );
}

export default RoomView;
