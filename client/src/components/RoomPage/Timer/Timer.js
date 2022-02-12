import React, { useState, useEffect } from 'react';
import * as styles from './Timer.module.css';

function Timer(props) {
    const [counter, setCounter] = useState(props.oneRoundTime);
    const [rounds, setRounds] = useState(0);

    useEffect(() => {
        let timer;

        if(rounds === props.rounds) {
            props.gameFinished();
            return;
        }

        if(props.isActive && counter >= 0 && rounds < props.rounds) {
            timer = setInterval(() => setCounter(counter - 1), 1000)
        }
        else {
            if(props.rounds > 1) {
               setRounds((rounds) => rounds + 1);
               props.nextQuestion();
            }
            else if(props.rounds === 1) {
                props.gameFinished();
            }
            
            setCounter(props.oneRoundTime);
        }

        return () => clearInterval(timer);
      }, [counter]);

    return (
        <div>
            <div className={styles.timer} style={{ width: (counter * 100 / props.oneRoundTime) + '%' }}></div>
        </div>
    );
}

export default Timer;
