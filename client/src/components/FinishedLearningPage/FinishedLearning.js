import React from 'react';
import * as styles from './FinishedLearning.module.css';
import { useHistory, useParams } from 'react-router-dom';

function FinishedLearning() {
    const history = useHistory();
    const { courseId } = useParams();

    return (
        <div className="page">
            <div className="container">
                <div className={styles.wrapper}>
                    <h2>Gratulacje!</h2>
                    <p>Nauczyłeś się nowych fiszek.</p>
                </div>
                <div className={styles.action}>
                    <button onClick={() => history.push('/kursy/' + courseId)}>Powrót do kursu</button>
                    <button onClick={() => history.push('/kursy')}>Przeglądaj inne kursy</button>
                </div>
            </div>
        </div>
    );
};

export default FinishedLearning;