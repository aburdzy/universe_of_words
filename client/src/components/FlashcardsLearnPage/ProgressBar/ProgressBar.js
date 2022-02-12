import React from 'react';
import * as styles from './ProgressBar.module.css';

function ProgressBar(props) {
    return (
        <div className={styles.progressBar}>
            <div className={styles.progressBarRememberd} 
                style={{
                    width:  (props.currentWidth / props.maxWidth) * 100 + '%',
                    padding: props.currentWidth > 0 ? '10px' : '0px',
                    borderTopLeftRadius: '4px',
                    borderBottomLeftRadius: '4px',
                    borderTopRightRadius: '0px',
                    borderBottomRightRadius: '0px'
                }}
            >{props.maxWidth > 0 &&  props.currentWidth / props.maxWidth !== 0 
            ? (Math.round(props.currentWidth / props.maxWidth * 100, 10) + '%') : null}
            </div>
        </div>
    );
}

export default ProgressBar;
