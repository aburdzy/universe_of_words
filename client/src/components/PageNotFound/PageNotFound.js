import React from 'react';
import * as styles from './PageNotFound.module.css';

function PageNotFound() {
    return (
        <div className={styles.container}>
            <h1 className={styles.code}>404</h1>
            <h2 className={styles.text}>Page not found</h2>
        </div>
    );
}

export default PageNotFound;
