import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router';
import * as styles from './NewCourse.module.css';
import FlashcardPreview from '../FlashcardPreview/FlashcardPreview';
import * as api from '../../api';
import cogoToast from 'cogo-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import LanguageSelect from '../LanguageSelect/LanguageSelect';
import { UserContext } from '../../contexts/UserContext';
import Modal from '../Modal/Modal';
import UploadImage from '../UploadImage/UploadImage';

function NewCourse() {
    const [flashcards, setFlashcards] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [isNewFlashcard, setIsNewFlashcard] = useState(false);
    const [publicAccess, setPublicAccess] = useState(false);
    const history = useHistory();
    const [checked, setChecked] = useState(false);
    const [index, setIndex] = useState(0);
    const [selectedLanguage, setSelectedLanguage] = useState();
    const [user] = useContext(UserContext);
    const [images, setImages] = useState([]);
    const [uploadImageModal, setUploadImageModal] = useState(false);
    const [uploadImageFlashcard, setUploadImageFlashcard] = useState(-1);

    useEffect(() => {
        if(user.banned) {
            history.push('/kursy');
        }
    }, []);


    function createNewCourse() {
        if(courseName === '') {
            cogoToast.error('Kurs musi posiadać nazwę.');
            return;
        }
        if(!flashcards.length > 0) {
            cogoToast.error('Kurs musi zawierać co najmniej jedną fiszkę.');
            return;
        }
        if(!selectedLanguage) {
            cogoToast.error('Wybierz język kursu.');
            return;
        }

        flashcards.forEach((flashcard) => { flashcard.image = images.filter((image) => image.flashcardId === flashcard.flashcardId).length > 0 ? 
            true : null });

        api.createCourse(flashcards, courseName, publicAccess * 1, selectedLanguage.label)
            .then((res) => {
                cogoToast.success('Dodano nowy kurs.');
                
                for(let i = 0; i < res.images.length; i++) {
                   
                    let image = images.filter((image) => image.flashcardId === res.images[i].tmpFlashcardId)[0].image;
                    
                    if(image) {
                        image.set('flashcardId', res.images[i].flashcardId);
                        api.uploadImage(image).catch((err) => cogoToast(err.message));
                    }                 
                }

                history.push('/kursy');
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function modifyCourseAccess() {
        setPublicAccess(!publicAccess);
    }

    function removeFlashcard(id) {
        const flashcard = flashcards.find(({ flashcardId }) => flashcardId === id);
        const tmpFlashcards = [...flashcards];
        const index = flashcards.indexOf(flashcard);

        tmpFlashcards.splice(index, 1);
        setFlashcards(tmpFlashcards);
    }

    function setter(newFlashcardId, question, answer) {        
        if(index === 0) {
            newFlashcardId = 0;
        }
        else {
            newFlashcardId = index + 1;
        }

        setFlashcards([...flashcards, { flashcardId: newFlashcardId, question, answer }]);
        setIndex(index + 1);
        setIsNewFlashcard(false);
    }

    function deleteEmptyFlashcard() {
        setIsNewFlashcard(false);
    }

    function updateFlashcard(flashcardId, question, answer) {
        const updatingFlashcard = flashcards.indexOf(flashcards.find(( flashcard ) => flashcard.flashcardId === flashcardId));
        let tmpFlashcards = [...flashcards];
        
        tmpFlashcards[updatingFlashcard].question = question;
        tmpFlashcards[updatingFlashcard].answer = answer;

        setFlashcards(tmpFlashcards);
    }

    function handleSelectedLanguage(selectedLanguage) {
        setSelectedLanguage(selectedLanguage);
    }

    function insertImage(src, flashcardId, image) {
        setImages([...images, { src, flashcardId, image }]);
    }

    function deleteImage(image) {
        let tmpImages = [...images];
        tmpImages.splice(images.indexOf(image), 1);

        setImages(tmpImages);
    }

    return (
        <div className="page">
            <div className="container">
                <div className={styles.header}>
                    <form className={styles.form}>
                        <input type="text" className={styles.courseName} placeholder={"Nazwa kursu"} onChange={(ev) => setCourseName(ev.target.value)} /> 
                    </form>
                    <div className={styles.inputContainer}>
                        <label htmlFor="type" className={styles.label}>{checked ? 'Publiczny' : 'Prywatny'}
                            <input id="type" type="checkbox" onChange={modifyCourseAccess} checked={publicAccess} />
                            <FontAwesomeIcon icon={checked ? faCheck : faTimes} className={checked ? styles.checked : styles.unchecked} onClick={() => setChecked(!checked)}/>
                        </label>
                    </div>
                </div>
                <LanguageSelect 
                    selectedLanguage={selectedLanguage}
                    handleSelectedLanguage={handleSelectedLanguage}
                    className="select"
                />
                {flashcards.length > 0 ? flashcards.map((flashcard) => {
                    return (
                        <FlashcardPreview
                            key={flashcard.flashcardId} 
                            modify={true}
                            isEditing={false}
                            question={flashcard.question}
                            answer={flashcard.answer}
                            setter={setter}
                            newCourse={true}
                            flashcardId={flashcard.flashcardId}
                            modifyFlashcard={updateFlashcard}
                            deleteFlashcard={() => removeFlashcard(flashcard.flashcardId)}
                            uploadImage={() => { 
                                setUploadImageFlashcard(flashcard.flashcardId); 
                                setUploadImageModal(true) 
                            }}
                            addImage={true}
                            showImage={true}
                            image={images.filter((image) => image.flashcardId === flashcard.flashcardId).length > 0 ? images.filter((image) => image.flashcardId === flashcard.flashcardId)[0].src : false}
                            showImage={true}
                        />
                    );
                }) :
                    <FlashcardPreview 
                        modify={true}
                        isEditing={true}
                        question={''}
                        answer={''}
                        setter={setter}
                        newCourse={true}
                    /> 
                }               
                {isNewFlashcard ? 
                    <FlashcardPreview 
                        modify={true}
                        isEditing={true}
                        question={''}
                        answer={''}
                        setter={setter}
                        newCourse={true}
                        deleteEmptyFlashcard={deleteEmptyFlashcard}
                    />
                : null}
                <button className={styles.add} onClick={() => setIsNewFlashcard(true)}>Dodaj fiszkę</button>
                <button className={styles.save} onClick={createNewCourse}>Zapisz</button>
            </div>
            <Modal 
                header={images.filter((image) => image.flashcardId === uploadImageFlashcard).length > 0 ? 'Edycja obrazka' : 'Dodawanie obrazka'}
                isOpen={uploadImageModal}
                onClose={() => setUploadImageModal(false)}
                width={'300px'}
                save={true}
            >
                {images.filter((image) => image.flashcardId === uploadImageFlashcard).length > 0 ?
                    <div className={styles.imageContainer}> 
                        <img src={images.filter((image) => image.flashcardId === uploadImageFlashcard)[0].src} className={styles.image} /> 
                        <button className={styles.deleteImage} onClick={() => deleteImage(images.filter((image) => image.flashcardId === uploadImageFlashcard)[0])}>Usuń obrazek</button>
                    </div>
                : 
                    <UploadImage 
                        flashcardId={uploadImageFlashcard} 
                        closeModal={() => {
                            setUploadImageModal(false);
                            setUploadImageFlashcard(-1);
                        }}
                        insertImage={insertImage}
                        newFlashcard={true}
                    />
                }
            </Modal>
        </div>
    );
}

export default NewCourse;
