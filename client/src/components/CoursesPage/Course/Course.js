import React from 'react';
import * as styles from './Course.module.css';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faLock, faTimes, faUnlock } from '@fortawesome/free-solid-svg-icons';

function Course(props) {
    const history = useHistory();

    function showCoursePreview() {
        history.push(`/kursy/${props.courseId}`);
    }

    return (
        <div className={styles.container} onClick={showCoursePreview}>
            <div className={styles.header}>
                <div className={styles.nameContainer}>
                {props.public ?
                        <div className={styles.padlock}>
                            <FontAwesomeIcon icon={faUnlock} size="lg" />
                        </div>
                    : 
                        <div className={styles.padlock}>
                            <FontAwesomeIcon icon={faLock} size="lg" />
                        </div>
                    } 
                    <h3 className={styles.name}>{props.name}</h3>
                   
                </div>
                <div className={styles.flashcardsProgress}>
                    <span>{props.completedFlashcards ? props.completedFlashcards : 0}</span>
                    <div className={styles.completedFlashcards}></div>        
                </div>
            </div>
            <div className={styles.courseInfo}>
                <div className={styles.completedInfo}>  
                    {props.completed ? <FontAwesomeIcon icon={faCheck} className={styles.completedSign} /> 
                    : <FontAwesomeIcon icon={faTimes} className={styles.uncompletedSign} />}
                    <span className={props.completed ? styles.greenStyle : styles.redStyle}>{props.completed ? 'Ukończony' : 'Nieukończony'}</span>                    
                </div>
                
                <div className={styles.flashcardsProgress}>
                    <span>{props.uncompletedFlashcards}</span>
                    <div className={styles.uncompletedFlashcards}></div>
                </div>  
            </div>
        </div>
    );
}

export default Course;