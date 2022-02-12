import React, { useState } from 'react';
import * as styles from '../Room/Room.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../Modal/Modal';
import * as api from '../../../api';
import cogoToast from 'cogo-toast';

function GameSettingsForOpponent(props) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewFlashcards, setViewFlashcards] = useState([]);

    function viewCourse() {
        api.getCourse(props.courseId)
        .then((res) => {
            setViewFlashcards(res.results);
            setIsOpen(true);
        })
        .catch((err) => cogoToast.error(err.message));
    }

    return (
        <div className={styles.opponentGameOptions}>
            <h3>Ustawienia rozgrywki</h3>
            <div className={styles.settingContainer}>
                <div className={`${styles.tile} ${styles.setting}`}>
                    <span>Czas trwania rundy</span>
                </div>
                <div className={`${styles.tile} ${styles.selectedSetting}`}>
                    <span>{props.gameTime} s</span>
                </div>
            </div>
            <div className={styles.settingContainer}>
                <div className={`${styles.tile} ${styles.setting}`}>
                    <span>Typ rozgrywki</span>
                </div>
                <div className={`${styles.tile} ${styles.selectedSetting}`}>
                    <span>{props.gameMode}</span>
                    <React.Fragment>
                        <FontAwesomeIcon icon={faInfoCircle} className={styles.icon} color="#040759"/>
                        <div className={styles.hint}>{props.hint}</div>
                    </React.Fragment>
                </div>
            </div>
            <div className={styles.settingContainer}>
                <div className={`${styles.tile} ${styles.setting}`}>
                    <span>Kurs</span>
                </div>
                <div className={`${styles.tile} ${styles.selectedSetting}`}>
                    <span>{props.selectedCourse}</span>
                </div>
            </div>
            <div className={styles.settingContainer}>
                <div className={`${styles.tile} ${styles.setting}`}>
                    <span>Język</span>
                </div>
                <div className={`${styles.tile} ${styles.selectedSetting}`}>
                    <span>{props.selectedLanguage}</span>
                </div>
            </div>
            {props.selectedCourse !== '-' ? <button className={styles.view} onClick={viewCourse}>Podejrzyj kurs</button> : null}
            <Modal 
                header="Fiszki w zestawie" 
                width={'300px'} 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)}
                save={true}
            >
            <div className={styles.modal}>
               {viewFlashcards.map((flashcard) => {
                   return (
                        <div key={flashcard.flashcard_id} className={styles.viewFlashcard}>
                            <span>{flashcard.question}</span>
                            <span>{flashcard.answer}</span>
                        </div>
                   );
               })}
               </div>
            </Modal>
        </div>
    );
}

export default GameSettingsForOpponent;
