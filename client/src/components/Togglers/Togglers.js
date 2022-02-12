import React, { useState, useEffect } from 'react';
import * as styles from './Togglers.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function Togglers(props) {
    const [toggle, setToggle] = useState(0);
    
    useEffect(() => {
        if(props.dependency) {
            props.action(toggle, props.dependency.value);
        }
        else {
            props.action(toggle);
        }
        
        if(props.sendToggle) {
            props.sendToggle(toggle);
        }
    }, [toggle, props.dependency]);

    function toogleActiveFilter(ev) {
        let togglers = document.querySelectorAll('.' + props.className);
      
        for(let i = 0; i < togglers.length; i++) {
            if(!togglers[i].classList.contains(styles.inActive)) {
                togglers[i].classList.add(styles.inActive);
            }
        }

        if(ev.target.classList.contains(styles.inActive)) {
            ev.target.classList.remove(styles.inActive);
            
            for(let i = 0; i < togglers.length; i++) {
                if(!togglers[i].classList.contains(styles.inActive)) {
                    setToggle(i);
                }
            }
        }
    }

    function convertNumberToStyle(number) {
        return ([styles.one, styles.two, styles.three])[number];
    }
    
    return (
        <div className={styles.container}>
            {props.options.map((option) => {
                return (
                    <button key={option} onClick={toogleActiveFilter} className={props.options[0] === option ?  `${props.className}` : `${props.className} ${styles.inActive}`}>
                        {option}
                        {props.icon && props.options[toggle] === option ? 
                            <React.Fragment>
                                <FontAwesomeIcon icon={faInfoCircle} className={styles.icon} color="#040759" /> 
                                <div className={`${styles.hint} ${convertNumberToStyle(toggle)}`}>{props.hints[toggle]}</div>                   
                            </React.Fragment>
                        : null}
                    </button>
                );
            })}
        </div>
    );
}

export default Togglers
