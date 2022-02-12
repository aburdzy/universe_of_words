import React, { useState, useEffect } from 'react';
import Flashcard from '../Flashcard/Flashcard';
import * as styles from './ChooseMode.module.css';
import Timer from '../Timer/Timer';

function ChooseMode(props) {
    const [randomAnswers, setRandomAnswers] = useState([]);
    const [isTimerActive, setIsTimerActive] = useState(true);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        resetButtonStyles();
        setRandomAnswers(randomizeAnswers(props.answers));
    }, [props.index])

    function randomizeAnswers(answers) {
        const correctAnswer = props.index;
        const max = answers.length;
        setDisabled(false);
      
        let answer1
        let answer2;
        let answer3;

        do {
            answer1 = Math.floor(Math.random() * max);
        } while(answer1 === correctAnswer);

        do {
            answer2 = Math.floor(Math.random() * max);
        } while(answer2 === answer1 || answer2 === correctAnswer);

        do {
            answer3 = Math.floor(Math.random() * max);
        } while(answer3 === answer1 || answer3 === correctAnswer || answer3 === answer2);

        const array = [correctAnswer, answer1, answer2, answer3]
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        return array;
    }

    function checkAnswer(flashcardId) {
        if(flashcardId === props.flashcards[props.index].flashcard_id) {
            props.setPoints([...props.points, props.flashcards[props.index]]);
        }
    }

    function showCorrectAnswer(flashcardId) {
        if(flashcardId === props.flashcards[props.index].flashcard_id) {
            return true;
        }

        return false;
    }

    function resetButtonStyles() {
        let answers = document.getElementsByTagName('button');

        for(let i = 0; i < answers.length; i++) {                    
            answers[i].className = '';
        }
    }

    function disableButtons() {
        let answers = document.getElementsByTagName('button');

        for(let i = 0; i < answers.length; i++) {                    
            if(!answers[i].classList.contains(styles.correct) && !answers[i].classList.contains(styles.incorrect)) {
                answers[i].classList.add(styles.disabled);
            }
        }
    }

    function nextQuestion() {
        if(props.rounds === 1) {
            if(props.flashcards.length - 1 === props.index) {
                setIsTimerActive(false);

                return;
            }
        }

        props.setIndex(props.index + 1);
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
            <div className={styles.answersContainer}>
                {randomAnswers.map((randomIndex) => {
                    return (
                        <button key={props.flashcards[randomIndex].flashcard_id} disabled={disabled}
                            className={disabled && showCorrectAnswer(props.flashcards[randomIndex].flashcard_id) ? styles.correct : null}
                            onClick={(ev) => {
                                checkAnswer(props.flashcards[randomIndex].flashcard_id);
                                setDisabled(true);
                                
                                if(!showCorrectAnswer(props.flashcards[randomIndex].flashcard_id)) {
                                    ev.target.classList.add(styles.incorrect);
                                }

                                disableButtons();

                                if(props.rounds === 1) {
                                    setTimeout(() => {
                                        nextQuestion();
                                    }, 1000);
                                }
                            }}>
                            {props.flashcards[randomIndex].answer}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default ChooseMode;
