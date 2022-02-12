import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import * as styles from './Results.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal, faArrowRight, faRedo, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Loader from '../../Loader/Loader';

function Results(props) {
    const [loading, setLoading] = useState(false);
    let history = useHistory();

    function showResults(winner, winnerPoints, loser, loserPoints) {
        return (
            <div className={styles.results}>
                <div className={styles.result}>
                    <div className={styles.info}>
                        <h3>{winner}</h3>
                        <span>Punkty: {winnerPoints}</span>
                    </div>
                    <div className={styles.icon}>
                        <FontAwesomeIcon icon={faMedal} color="#FFD700" size="3x"/>
                    </div>
                </div>
                <div className={styles.result}>
                    <div className={styles.info}>
                        <h3>{loser}</h3>
                        <span>Punkty: {loserPoints}</span>
                    </div>
                    <div className={styles.icon}>
                        {winnerPoints === loserPoints ? <FontAwesomeIcon icon={faMedal} color="#FFD700" size="3x"/> 
                        : <FontAwesomeIcon icon={faMedal} color="#C0C0C0" size="3x"/>}
                    </div>
                </div>
            </div>
        );
    }

    function showButtons() {
        return (
            <div className={styles.pages}>
                <button onClick={() => history.push('/poczekalnia')}><FontAwesomeIcon icon={faArrowLeft} />lobby</button>
                <button onClick={props.refreshRoom}><FontAwesomeIcon icon={faRedo} />pokój</button>
                <button onClick={() => history.push('/kursy')}>kursy<FontAwesomeIcon icon={faArrowRight} /></button>
            </div>
        );
    }

    return (
        <div className={styles.resultsContainer}>
            {loading ? <Loader /> :
                props.userPoints > props.opponentPoints ? 
                <React.Fragment>
                    {showResults(props.userUsername + ' (ja)', props.userPoints, props.opponentUsername, props.opponentPoints)}
                    {showButtons()}
                </React.Fragment>
            : 
                <React.Fragment>
                    {showResults(props.opponentUsername, props.opponentPoints, props.userUsername + ' (ja)', props.userPoints)}      
                    {showButtons()}
                </React.Fragment>
            }
        </div>
    );
}

export default Results;
