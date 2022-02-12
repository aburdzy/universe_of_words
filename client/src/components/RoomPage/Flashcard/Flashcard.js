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
            <div className={styles.phrase}>{props.text}</div>
        </div>
    );
}

export default Flashcard;
