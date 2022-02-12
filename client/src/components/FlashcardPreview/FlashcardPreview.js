import React, { useState, useRef, useEffect } from 'react';
import * as styles from './FlashcardPreview.module.css';
import MousedownCheck from '../MousedownCheck';
import cogoToast from 'cogo-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle, faImage, faPen, faCheck } from '@fortawesome/free-solid-svg-icons';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function FlashcardPreview(props) {
    const [isEditing, setIsEditing] = useState(props.isEditing);
    const [value, setValue] = useState({
        question: props.question, 
        answer: props.answer
    });
    const inputRef = useRef(null);

    function onSubmit(ev) {
        ev.preventDefault();
        modifyFlashcard();
    }

    function modifyFlashcard() {
        setIsEditing(false);

        if(props.newCourse && (value.question !== '' || value.answer !== '')) {
            if(value.question === '' || value.answer === '') {
                cogoToast.error('Dopisz pozostałą część fiszki.');
            }

            if(props.flashcardId !== undefined) {
                if(value.question === '' && value.answer === '') {
                    cogoToast.error('Fiszka nie może być pusta.');
                    return;
                }
                props.modifyFlashcard(props.flashcardId, value.question, value.answer);
                return;
            }

            props.setter(props.newFlashcardId, value.question, value.answer);
            return;
        }

        if(value.question === '' && value.answer === '') {
            if(props.deleteEmptyFlashcard) {
                props.deleteEmptyFlashcard();
            }
            else {
                cogoToast.error('Fiszka nie może być pusta.');
            }
            
            return;
        }

        if(value.question !== '' || value.answer !== '') {   
            if(value.question === '' || value.answer === '') {
                cogoToast.error('Uzupełnij pozostałą część fiszki.');
            }
            
            if(props.flashcardId === undefined) {
                props.newFlashcard(props.courseId, value.question, value.answer);
                return;
            }

            if(value.question === '' && value.answer === '') {
                cogoToast.error('Fiszka nie może być pusta.');
                return;
            }

            props.updateFlashcard(props.flashcardId, value.question, value.answer);
            return;
        }
    }

    useEffect(() => {        
        if(isEditing) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    return (
        <div className={styles.flashcard}>
            {isEditing ? null : props.modify ?
            <div className={styles.options}>
                <div className={styles.editContainer}>
                    <FontAwesomeIcon icon={faPen} className={styles.edit} onClick={() => setIsEditing(true)} />
                </div>
                <div className={styles.deleteContainer}>
                    <FontAwesomeIcon icon={faTimes} className={styles.delete} onClick={() => props.deleteFlashcard()} />
                </div> 
            </div>                
            : null}
            <MousedownCheck 
                className="form"
                action={modifyFlashcard}
                dependency={isEditing}
                field1={value.question}
                field2={value.answer}
            >
            {isEditing ? 
                <form className="form" onSubmit={(ev) => onSubmit(ev)}>
                    <input ref={inputRef} type="text" placeholder="Pytanie" defaultValue={props.question} onChange={(ev) => setValue({...value, question: ev.target.value})} /> 
                    <input type="text" placeholder="Odpowiedź" defaultValue={props.answer} onChange={(ev) => setValue({...value, answer: ev.target.value})} /> 
                </form> 
            :
                <React.Fragment>
                    <div className={styles.texts}>
                        <div className={props.modify  ? `${styles.text} ${styles.modify}` : styles.text}>{value.question}</div>
                        <div className={props.modify  ? `${styles.text} ${styles.modify}` : styles.text}>{value.answer}</div>
                    </div>
                    {props.image && props.showImage ?
                        <div className={props.uploadImage ? `${styles.imageContainer} ${styles.pointer}` : styles.imageContainer} onClick={props.uploadImage}>
                            <LazyLoadImage
                                alt={'obraz'}
                                style={{ borderRadius: '4%', display: 'flex' }}
                                src={props.image}
                                width='100%'
                                effect='blur' 
                            />
                        </div>
                    :  props.showImage ? 
                        <div className={styles.image} onClick={props.uploadImage} style={{ cursor: props.modify ? 'pointer' : 'default' }}>
                            <FontAwesomeIcon icon={faImage} className={styles.icon} size='4x' />
                        </div>
                    : null}
                </React.Fragment>
            }
            </MousedownCheck>
            {props.showCompleted ? <FontAwesomeIcon className={styles.completed} icon={faCheckCircle} color="#01A02D" style={{backgroundColor: 'white', borderRadius: '100%'}}/> : null}
        </div> 
    );
}

export default FlashcardPreview;
