import React from 'react';
import * as styles from './Flashcard.module.css';

function Flashcard(props) {
    return (
        <div className={styles.flashcard}>
            {props.image ?
            <div className={styles.imageContainer}>
                <img src={props.image} className={styles.image}/>
            </div>
            : null}
            {!props.flip ? 
                <span className={styles.phrase}>{props.front}</span> 
            : 
                <span className={styles.phrase}>{props.back}</span>
            }
        </div>
    );
}

export default Flashcard;
