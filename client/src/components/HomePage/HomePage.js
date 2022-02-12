import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router';
import * as styles from './HomePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../contexts/UserContext';

function HomePage() {    
    const history = useHistory();
    const [user] = useContext(UserContext);

    useEffect(() => {
        if(document.cookie.includes('token')) {
            history.push('/kursy');
        }
    }, []);


    return (
        <div className="page">
            <h1>Ucz się szybciej, ucz się więcej!</h1>
            <div className={styles.blobContainer}>
                <div className={styles.blobLeftContainer} onClick={user.logged ? () => history.push('/poczekalnia') : () => history.push('/logowanie')}>
                    <div className={styles.blobContent}>
                        <div className={styles.blobHeader}>
                            <FontAwesomeIcon icon={faUsers} size="3x" color="#040759"/>
                            <h2 className={styles.blobHeaderTitle}>Rywalizuj</h2>
                        </div>
                        <div>
                            <p className={styles.blobHeaderContent}>Konkuruj z innymi osobami</p>  
                        </div>      
                    </div>
                </div>
                <div className={styles.blobRightContainer} onClick={user.logged ? () => history.push('/kursy') : () => history.push('/logowanie')}>
                    <div className={styles.blobContent}>
                        <div className={styles.blobHeader}>
                            <FontAwesomeIcon icon={faHome} size="3x" color="#040759"/>
                            <h2 className={styles.blobHeaderTitle}>Ćwicz sam</h2>
                        </div>
                        <div>
                            <p className={styles.blobHeaderContent}>Rozwijaj swoje umiejętności</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
