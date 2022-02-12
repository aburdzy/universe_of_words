import React from 'react';
import * as styles from './Modal.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';

function Modal(props) {    
    if(!props.isOpen) {
        return null;
    }
    
    return (
        <div className={styles.overlay}>
            <div className={styles.container} style={{ width: props.width ? props.width : 'initial' }}>
            <div className={styles.closeContainer}>
                <FontAwesomeIcon icon={faWindowClose} color="#B00000" className={styles.closeModal} size="2x" 
                    onClick={() => {
                        props.onClose();
                    }} 
                />
            </div>
            <h3 className={styles.header}>{props.header}</h3>            
                {props.children}
                {props.save ? null : 
                    <div className={styles.buttons}>
                        <button className={styles.action} 
                            onClick={() => { 
                                props.action();
                                props.onClose();
                            }}>
                            {props.confirm}</button>
                        <button className={styles.cancel} 
                            onClick={() => {
                                if(props.clear) props.clear();
                                props.onClose();
                            }}>
                            {props.cancel}</button>
                    </div>
                }
            </div>
        </div>
    );
}

export default Modal;
