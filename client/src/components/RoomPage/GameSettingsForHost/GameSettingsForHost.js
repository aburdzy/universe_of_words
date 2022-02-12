import React, { useState } from 'react';
import * as styles from '../Room/Room.module.css';
import selectStyles from '../../../helpers/selectStyles';
import Togglers from '../../Togglers/Togglers';
import Select from 'react-select';
import LanguageSelect from '../../LanguageSelect/LanguageSelect';
import Modal from '../../Modal/Modal';
import * as api from '../../../api';
import cogoToast from 'cogo-toast';

function GameSettingsForHost(props) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewFlashcards, setViewFlashcards] = useState([]);


    function viewCourse() {
        api.getCourse(props.selectedCourse.value)
        .then((res) => {
            setViewFlashcards(res.results);
            setIsOpen(true);
        })
        .catch((err) => cogoToast.error(err.message));
    }

    return (
        <React.Fragment>
        <div className={styles.gameOptions}>                
            <h3>Czas trwania rundy</h3>
            <Togglers
                action={props.setGameTime}
                options={props.times}
                sendToggle={props.sendGameTime}
                className={'time'}
            />
            <h3>Typ rozgrywki</h3>
            <Togglers 
                action={props.setGameMode}
                sendToggle={props.sendGameType}
                className={'gameType'}
                icon={true}
                options={props.gameModeTexts}
                hints={props.hints}
            />
            <div className={styles.selectContainer}>
                <LanguageSelect
                    selectedLanguage={props.selectedLanguage}
                    handleSelectedLanguage={props.handleSelectedLanguage}
                />
                <Select
                    value={props.selectedCourse}
                    onChange={props.handleSelectedCourseChange}
                    options={props.courses} noOptionsMessage={() => 'Brak opcji'}
                    isSearchable={true}
                    placeholder={'Wybierz kurs'}
                    styles={selectStyles}
                />                          
            </div>
            {props.selectedCourse && Object.keys(props.selectedCourse).length > 0 ? <button className={styles.view} onClick={viewCourse}>Podejrzyj kurs</button> : null}
            <button className={styles.startGame} onClick={props.startGame}>Graj</button>
        </div>
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
     </React.Fragment>
    );
}

export default GameSettingsForHost;