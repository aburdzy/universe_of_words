import React from 'react';
import * as styles from './Loader.module.css';

function Loader(props) {
    return (
        <div className={props.wrapper ? styles.wrapper : styles.loader}>
            <div className={styles.circle1} style={{ backgroundColor: props.backgroundColor ? props.backgroundColor : 'rgba(255, 255, 255, 0.7)' }}></div>
            <div className={styles.circle2} style={{ backgroundColor: props.backgroundColor ? props.backgroundColor : 'rgba(255, 255, 255, 0.7)' }}></div>
            <div className={styles.circle3} style={{ backgroundColor: props.backgroundColor ? props.backgroundColor : 'rgba(255, 255, 255, 0.7)' }}></div>
        </div>
    );
}

export default Loader;
