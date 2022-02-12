import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import * as styles from './FlashcardsLearn.module.css';
import Flashcard from '../Flashcard/Flashcard';
import * as api from '../../../api';
import cogoToast from 'cogo-toast';
import Loader from '../../Loader/Loader';
import ProgressBar from '../ProgressBar/ProgressBar';
import PageNotFound from '../../PageNotFound/PageNotFound';
import Togglers from '../../Togglers/Togglers';
import Select from 'react-select';
import selectStyles from '../../../helpers/selectStyles';

function FlashcardsLearn() {
    const [flashcards, setFlashcards] = useState([]);
    const [flashcardsPool, setFlashcardsPool] = useState([]);

    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [maxFlashcards, setMaxFlashcards] = useState([]);

    const [rememberedFlashcards, setRememberedFlashcards] = useState(0);

    const [flip, setFlip] = useState(false);

    const [selectedAmount, setSelectedAmount] = useState(1);
    const [filter, setFilter] = useState(0);

    const [learn, setLearn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [canLearning, setCanLearning] = useState();

    const { courseId } = useParams();
    const history = useHistory();

    useEffect(() => {
        api.getFlashcardsAmount(courseId, filter)
            .then((res) => {
                if(res.status === 'ok') {
                    if(res.results === 0) {
                        setSelectedAmount({ value: 0, label: '0' });
                    }
                    else if(filter === 2) {
                        setSelectedAmount({ value: res.results, label: res.results.toString() });
                    }
                    else {
                        setSelectedAmount({ value: 1, label: '1' });
                    }
                    
                    setMaxFlashcards([]);

                    for(let i = 1; i <= res.results; i++) {
                        setMaxFlashcards((maxFlashcards) => [...maxFlashcards, { value: i, label: i.toString() }]);
                    }
                    setLoading(false);
                    setCanLearning(true);
                }
                else {
                    setLoading(false);
                    setCanLearning(false);
                } 
            })
            .catch((err) => { 
                setLoading(false);
                setCanLearning(false);
                cogoToast.error(err.message) 
            });
    }, [filter]);

    useEffect(() => {
        if(flashcards.length > 0 && flashcards.length === rememberedFlashcards) {
            setTimeout(() => {
                finishLearning();
            }, 700);
        }
    }, [rememberedFlashcards]);

    function nextFlashcard() {
        if(currentFlashcardIndex < flashcardsPool.length - 1) {
            setCurrentFlashcardIndex(currentFlashcardIndex + 1);
        }
        else if(currentFlashcardIndex === flashcardsPool.length - 1) {
            nextRound();
        }
    }

    function removeFlashcard() {        
        let tmpFlashcardsPool = [...flashcardsPool];
        tmpFlashcardsPool.splice(currentFlashcardIndex, 1);

        setFlashcardsPool(tmpFlashcardsPool);

        if(currentFlashcardIndex === flashcardsPool.length - 1) {
            nextRound();
        }
    }

    function nextRound() {
        setCurrentFlashcardIndex(0);
    }

    function repeatFlashcard() {
        nextFlashcard();
        flipFlashcard();
    }

    function rememberFlashcard() {
        setRememberedFlashcards(rememberedFlashcards + 1);

        if(flashcardsPool.length === 1) {
            return;
        }

        removeFlashcard();
        flipFlashcard();
    }

    function flipFlashcard() {
        setFlip(!flip);
    }

    function startLearning() {
        if(selectedAmount.value === 0) {
            cogoToast.error('Brak fiszek. Zmień ustawienia.');
            return;
        }

        api.getFlashcards(courseId, filter, selectedAmount.value)
            .then((res) => {
                setFlashcardsPool(res.results);
                setFlashcards(res.results);
                setLearn(true);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function handleSelectedAmount(selectedAmount) {
        setSelectedAmount(selectedAmount);
    }

    function setFlashcardsOptions() {
        return (
            <div className={styles.flashcardsOptions}>
                <h3>Ile fiszek chcesz zapamiętać?</h3>
                <div className={styles.flashcardsAmountContainer}>
                    <Togglers 
                        options={['Nowe', 'Powtórz', 'Wszystkie']}
                        action={setFilter}
                        className={'filter'}
                    />
                    <div className={styles.select}>
                        <Select
                            value={selectedAmount}
                            onChange={handleSelectedAmount}
                            options={maxFlashcards} noOptionsMessage={() => 'Brak opcji'}
                            isSearchable={true}
                            placeholder={'Wybierz ilość'}
                            styles={selectStyles}
                        />
                    </div>
                </div>
                <button className={styles.startLearning} onClick={startLearning}>Dalej</button>
            </div>
        );
    }

    function finishLearning() {
        setLoading(true);

        api.setFlashcardsCompleted(flashcards)
            .then(() => {
                setTimeout(() => {
                    setLoading(false);
                    history.push('/kursy/' + courseId + '/ukonczono');
                }, 200);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    return (
        <div className="page">
            <div className="container">
                {loading ? <Loader /> : !canLearning ? <PageNotFound /> :
                    !learn ? 
                        setFlashcardsOptions()
                    : <React.Fragment>
                        {flashcardsPool.length > 0 ?
                            <React.Fragment>
                                <ProgressBar 
                                    maxWidth={flashcards.length}
                                    currentWidth={rememberedFlashcards}
                                />
                                <Flashcard 
                                    front={flashcardsPool[currentFlashcardIndex].question}
                                    back={flashcardsPool[currentFlashcardIndex].answer}
                                    flip={flip}
                                    image={flashcardsPool[currentFlashcardIndex].src}
                                />
                                <div className={styles.buttons}>
                                    {!flip ?   
                                        <button className={styles.check} 
                                            onClick={() => setFlip(!flip)}>Sprawdź</button>
                                    :
                                        <React.Fragment>
                                            <button className={styles.repeatFlashcard} onClick={repeatFlashcard}>Powtórz</button>
                                            <button className={styles.rememberFlashcard} onClick={rememberFlashcard}>Pamiętam</button>
                                        </React.Fragment>
                                    }
                                </div>
                            </React.Fragment>
                        : null}
                    </React.Fragment>
                }
            </div>
        </div>
    );
}

export default FlashcardsLearn;
