import React, { useRef, useState, useEffect } from 'react';
import * as styles from './WriteMode.module.css';
import Timer from '../Timer/Timer';
import Flashcard from '../Flashcard/Flashcard';

function WriteMode(props) {
    const [isTimerActive, setIsTimerActive] = useState(true);
    const [userAnswer, setUserAnswer] = useState('');
    const inputRef = useRef(null);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        if(inputRef) {
            inputRef.current.focus();
        }
    }, [userAnswer]);

    function nextQuestion() {
        setUserAnswer('');
        setDisabled(false);

        if(props.flashcards.length - 1 === props.index) {
            setIsTimerActive(false);

            return;
        }

        props.setIndex(props.index + 1);

        if(inputRef.current) {
            inputRef.current.style.borderColor = '#B0C6EE';
            inputRef.current.style.color = '#040759';
        }
    }


    function checkAnswer() {
        if(userAnswer === props.flashcards[props.index].answer) {
            inputRef.current.style.borderColor = 'rgba(1, 160, 45, 0.3)';
            inputRef.current.style.color = '#01A02D';
            
            props.setPoints([...props.points, props.flashcards[props.index]]);
            setDisabled(true);
        }
        else {
            inputRef.current.style.borderColor = 'rgba(176, 0, 0, 0.3)';
            inputRef.current.style.color = '#B00000';

            setUserAnswer(props.flashcards[props.index].answer);
            setDisabled(true);
        }
    }

    function gameFinished() {
        props.getOpponentResult();
    }

    return (
        <div className={styles.container}> 
            <Timer 
                isActive={isTimerActive}
                rounds={props.rounds}
                oneRoundTime={props.oneRoundTime}
                nextQuestion={nextQuestion}
                gameFinished={gameFinished}
            />
            <Flashcard 
                text={props.flashcards[props.index].question} 
                image={props.flashcards[props.index].src}
            />
            <form onSubmit={(ev) => ev.preventDefault()} className={styles.form}>
                <input className={styles.input} type="text" ref={inputRef} placeholder="Wpisz odpowiedź" value={userAnswer} onChange={(ev) => setUserAnswer(ev.target.value)} disabled={disabled} />
                <div className={styles.buttonsContainer}>
                    <button className={styles.check}onClick={checkAnswer}>Sprawdź</button>
                </div>
            </form>
        </div>
    );
}

export default WriteMode;
