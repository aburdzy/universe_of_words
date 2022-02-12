import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Loader from '../Loader/Loader';
import PageNotFound from '../PageNotFound/PageNotFound';
import FlashcardPreview from '../FlashcardPreview/FlashcardPreview';
import * as styles from './EditCourse.module.css';
import MousedownCheck from '../MousedownCheck';
import * as api from '../../api';
import cogoToast from 'cogo-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen } from '@fortawesome/free-solid-svg-icons';
import LanguageSelect from '../LanguageSelect/LanguageSelect';
import Modal from '../Modal/Modal';
import UploadImage from '../UploadImage/UploadImage';

function EditCourse() {
    const [flashcards, setFlashcards] = useState([]);
    const [isCourseFound, setIsCourseFound] = useState();
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [isNewFlashcard, setIsNewFlashcard] = useState(false);

    const [newCourseName, setNewCourseName] = useState('');
    const [currentCourseName, setCurrentCourseName] = useState('');

    const [publicAccess, setPublicAccess] = useState(false);
    const [permissions, setPermission] = useState();
    const [selectedLanguage, setSelectedLanguage] = useState();

    const [newFlashcards, setNewFlashcards] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [updatedFlashcards, setUpdatedFlashcards] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [flashcardToDeleteId, setFlashcardToDeleteId] = useState(-1);

    const [uploadImageModal, setUploadImageModal] = useState(false);
    const [uploadImageFlashcard, setUploadImageFlashcard] = useState(-1);
    const [images, setImages] = useState([]);

    const inputRef = useRef(null);
    
    const { courseId } = useParams();
    const history = useHistory();

    useEffect(() => {
        api.getCourse(courseId, 1)
            .then((res) => {
                if(res.status === 'ok') {
                    setFlashcards(res.results);             

                    api.getUserInfo()
                        .then((user) => {
                            if(user.user.id === res.permissions[0].owner_id) {
                                setCurrentCourseName(res.results[0].name);
                                setNewCourseName(res.results[0].name);
                                setPublicAccess(res.results[0].public_access);
                                setPermission(res.permissions[0].user_id);
                                setSelectedLanguage({ value: res.results[0].language, label: res.results[0].language });
            
                                setIsCourseFound(true);

                                api.getImages(courseId).then((results) => {
                                    setImages(results.results);
                                    setLoading(false);
                                })
                                .catch((err) => cogoToast(err.message));
                            }
                        })
                        .catch((err) => cogoToast.error(err));
                }
                else {
                    setIsCourseFound(false);
                    setLoading(false);
                }
            })
            .catch((err) => { 
                setIsCourseFound(false);
                setLoading(false);
                cogoToast.error(err.message) 
            });
    }, []);


    useEffect(() => {
        if(isEditing) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    function deleteFlashcard(flashcardId) {
        const [flashcardToDelete] = flashcards.filter((flashcard) => flashcard.flashcard_id === flashcardId);

        if(newFlashcards.some((flashcard) => flashcard.flashcard_id === flashcardToDelete.flashcard_id)) {
            setNewFlashcards(newFlashcards.filter((flashcard) => flashcard.flashcard_id !== flashcardId));
            setFlashcards(flashcards.filter((flashcard) => flashcard.flashcard_id !== flashcardId));
            setNewImages(newImages.filter((flashcard) => flashcard.flashcardId !== flashcardId));
        }
        else {
            api.deleteFlashcard(flashcardId)
                .then((res) => {
                    if(res.status === 'ok') {
                        const newFlashcards = flashcards.filter((flashcard) => flashcard.flashcard_id !== flashcardId);
                        setFlashcards(newFlashcards);
        
                        if(res.redirect) {
                            cogoToast.success('Usunięto kurs.');
                            history.push('/kursy');
                        }

                        setFlashcardToDeleteId(-1);
                    }
                    else if(res.error) {
                        cogoToast.error(res.error);
                    }
                })
                .catch((err) => cogoToast.error(err.message));
        }
       
        // setModalVisible(false);
    }

    function submitCourseName(ev) {
        ev.preventDefault();
        modifyCourseName();
    }

    function modifyCourseName() {
        setIsEditing(false);

        if(currentCourseName !== newCourseName && newCourseName !== '') {
            api.updateCourseName(courseId, newCourseName)
                .then(() => {
                    setCurrentCourseName(newCourseName);
                    setNewCourseName('');
                    cogoToast.success('Nazwa kursu została zmieniona.');
                })
                .catch((err) => cogoToast.error(err.message));
        }
        else if(newCourseName === '') {
            cogoToast.error('Nazwa kursu nie może być pusta.');
        } 
    }

    function modifyCourseAccess() {
        api.updateCourseAccess(courseId, !publicAccess * 1)
            .then(() => {
                setPublicAccess(!publicAccess);
                cogoToast.success('Zmieniono dostępność kursu.');
            })
            .catch((err) => cogoToast.error(err.message));

        setPublicAccess(!publicAccess);
    }

    function newFlashcard(courseId, question, answer) {
        let tmpFlashcardId = (flashcards.map((flashcard ) => { return flashcard.flashcard_id }).reduce((max, val) => max > val ? max : val)) + 1;
        
        setFlashcards([...flashcards, 
            { 
                flashcard_id: tmpFlashcardId, 
                course_id: courseId, 
                question, 
                answer 
            }
        ]);

        setNewFlashcards([...newFlashcards, 
            {
                flashcard_id: tmpFlashcardId,  
                course_id: courseId, 
                question, 
                answer
            }
        ]);

        setIsNewFlashcard(false);
    }

    function deleteEmptyFlashcard() {
        setIsNewFlashcard(false);
    }

    function updateFlashcard(flashcardId, question, answer) {
        let tmpFlashcards = [...flashcards];
        let index = tmpFlashcards.findIndex(({ flashcard_id }) => flashcardId === flashcard_id);
        tmpFlashcards[index] = {... tmpFlashcards[index], question, answer };
        
        setFlashcards(tmpFlashcards);

        if(newFlashcards.some((flashcard) => flashcard.flashcard_id === flashcardId)) {
            let tmpNewFlashcards = [...newFlashcards];
            let index = tmpNewFlashcards.findIndex(({ flashcard_id }) => flashcardId === flashcard_id);
            tmpNewFlashcards[index] = {... tmpFlashcards[index], question, answer };
            
            setNewFlashcards(tmpNewFlashcards);

            return;
        }

        let isFlashcardEditedBefore = updatedFlashcards.find((flashcard) => flashcard.flashcard_id === flashcardId);

        if(isFlashcardEditedBefore === undefined) {
            setUpdatedFlashcards([...updatedFlashcards, { flashcard_id: flashcardId, course_id: courseId, question, answer }]);
        }
        else {
            let tmpUpdatedFlashcards = [...updatedFlashcards];
            let tmpUpdatedFlashcardsIndex = tmpUpdatedFlashcards.findIndex(({ flashcard_id }) => flashcardId === flashcard_id);

            tmpUpdatedFlashcards[tmpUpdatedFlashcardsIndex] = {... tmpUpdatedFlashcards[tmpUpdatedFlashcardsIndex], question, answer };
            setUpdatedFlashcards(tmpUpdatedFlashcards);
        }
    }

    function handleSelectedLanguage(selectedLanguage) {
        api.updateCourseLanguage(courseId, selectedLanguage.label)
            .then(() => cogoToast.success('Zmieniono język kursu.'))
            .catch((err) => cogoToast.error(err.message));

        setSelectedLanguage(selectedLanguage);
    }

    function updateCourse() {
        if(newFlashcards.length > 0 && updatedFlashcards.length > 0) {
            newFlashcards.forEach((flashcard) => { flashcard.image = newImages.filter((image) => image.flashcardId === flashcard.flashcard_id).length > 0 ? 
                true : null });

                api.updateFlashcards(flashcards)
                    .then(() => {
                        api.insertFlashcards(newFlashcards)
                            .then((res) => {
                                const uploadPromises = [];
            
                                for (let i = 0; i < res.images.length; i++) {
                                    let image = newImages.filter((image) => image.flashcardId === res.images[i].tmpFlashcardId)[0].image;
            
                                    if (image) {
                                        image.set('flashcardId', res.images[i].flashcardId);
                                        uploadPromises.push(api.uploadImage(image));
                                    }
                                }
        
                            return Promise.all(uploadPromises);
                        })
                        .then(() => history.push('/kursy/' + courseId))
                        .catch((err) => cogoToast.error(err.message));
                    })
                    .catch((err) => cogoToast.error(err.message));
        }
        else if(updatedFlashcards.length > 0) {
            api.updateFlashcards(flashcards)
                .then(() => {
                    cogoToast.success('Zmiany zostały zapisane');
                    history.push('/kursy/' + courseId);
                })
                .catch((err) => cogoToast.error(err.message));
        }
        else if (newFlashcards.length > 0) {
            newFlashcards.forEach((flashcard) => {
                flashcard.image = newImages.filter((image) => image.flashcardId === flashcard.flashcard_id).length > 0
                    ? true : null;
            });

            api.insertFlashcards(newFlashcards)
                .then((res) => {
                    const uploadPromises = [];

                    for (let i = 0; i < res.images.length; i++) {
                        let image = newImages.filter((image) => image.flashcardId === res.images[i].tmpFlashcardId)[0].image;

                        if (image) {
                            image.set('flashcardId', res.images[i].flashcardId);
                            uploadPromises.push(api.uploadImage(image));
                        }
                    }

                    return Promise.all(uploadPromises);
                })
                .then(() => history.push('/kursy/' + courseId))
                .catch((err) => cogoToast.error(err.message));
        }
    }

    function updateImage(image, flashcardId) {
        setImages([...images, { flashcard_id: flashcardId, src: image, course_id: courseId }]);
    }

    function deleteImage(flashcardId) {
        if(newFlashcards.find((flashcard) => flashcard.flashcard_id === flashcardId)) {
            setNewImages(newImages.filter((image) => image.flashcardId !== flashcardId));

            return;
        }
        
        else if(flashcards.find((flashcard) => flashcard.flashcard_id === flashcardId)) {
            api.deleteImage(flashcardId)
                .then(() => {
                    setImages(images.filter((image) => image.flashcard_id !== flashcardId));
                })
                .catch((err) => cogoToast.error(err.message));

                return;
            }
        
    }

    function insertImage(src, flashcardId, image) {
        setNewImages([...newImages, { src, flashcardId, image }]);
    }

    return (
        <div className="page">
            <div className="container">
                {loading ? <Loader /> : !isCourseFound ? <PageNotFound /> :
                    <div className={styles.container}>
                        <div className={styles.courseName}>
                            {isEditing ?
                                <MousedownCheck
                                    className={"newCourseName"} 
                                    dependency={isEditing} 
                                    action={modifyCourseName}
                                    field1={newCourseName}
                                > 
                                    <form className={styles.form} onSubmit={(ev) => submitCourseName(ev)}>
                                        <input type="text" ref={inputRef} className="newCourseName" defaultValue={newCourseName} onChange={(ev) => setNewCourseName(ev.target.value)} /> 
                                    </form>
                                </MousedownCheck>
                                : <h2>{currentCourseName}</h2>
                            }
                            <FontAwesomeIcon icon={faPen} className={styles.edit} onClick={() => setIsEditing(!isEditing)} />
                            <div className={styles.inputContainer}>
                                <label htmlFor="type" className={styles.label}>{publicAccess ? 'Publiczny' : 'Prywatny'}
                                    <input id="type" type="checkbox" onChange={modifyCourseAccess} checked={publicAccess} />
                                    <span className={styles.checkmark}>
                                        {publicAccess ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}
                                    </span>
                                </label>
                            </div>
                        </div>
                        <LanguageSelect 
                            selectedLanguage={selectedLanguage}
                            handleSelectedLanguage={handleSelectedLanguage}
                            className="select"
                        /> 
                        {flashcards.map((flashcard) => {
                            return (
                                <FlashcardPreview
                                    key={flashcard.flashcard_id}
                                    flashcardId={flashcard.flashcard_id}
                                    question={flashcard.question}
                                    answer={flashcard.answer} 
                                    modify={true}
                                    updateFlashcard={updateFlashcard} 
                                    deleteFlashcard={() => { 
                                        setFlashcardToDeleteId(flashcard.flashcard_id);
                                        setModalVisible(true);
                                    }}
                                    isEditing={false}
                                    flashcards={flashcards}
                                    courseId={courseId}
                                    uploadImage={() => { 
                                        setUploadImageFlashcard(flashcard.flashcard_id); 
                                        setUploadImageModal(true) 
                                    }}
                                    addImage={true}
                                    image={images.filter((image) => image.flashcard_id === flashcard.flashcard_id).length > 0 ? 
                                        images.filter((image) => image.flashcard_id === flashcard.flashcard_id)[0].src : 
                                        newImages.filter((image) => image.flashcardId === flashcard.flashcard_id).length > 0 ?
                                        newImages.filter((image) => image.flashcardId === flashcard.flashcard_id)[0].src : false 
                                    }
                                    showImage={flashcards.filter((fl) => fl.flashcard_id === flashcard.flashcard_id).length > 0 ? true : false}
                                />
                            );
                        })}
                        {isNewFlashcard ? 
                            <FlashcardPreview 
                                isEditing={true} 
                                modify={true} 
                                question={''} 
                                answer={''} 
                                courseId={courseId}
                                newFlashcard={newFlashcard}
                                deleteEmptyFlashcard={deleteEmptyFlashcard}
                            /> 
                        : null}
                        <button className={styles.add} onClick={() => setIsNewFlashcard(true)}>Dodaj fiszkę</button>                
                        <button className={styles.save} onClick={updateCourse}>Zapisz</button>                
                    </div>
                }
            </div>
            <Modal 
                header={'Czy na pewno chcesz usunąć fiszkę?'}
                isOpen={modalVisible}
                onClose={() => setModalVisible(false)}
                width={'300px'}
                confirm='Usuń'
                action={() => deleteFlashcard(flashcardToDeleteId)}
                cancel='Anuluj'
                clear={() => setFlashcardToDeleteId(-1)}
            >
            </Modal>
            <Modal 
                header={images.filter((image) => image.flashcard_id === uploadImageFlashcard).length > 0 ? 'Edycja obrazka' : 'Dodawanie obrazka'}
                isOpen={uploadImageModal}
                onClose={() => setUploadImageModal(false)}
                width={'300px'}
                save={true}
            >
                {images.filter((image) => image.flashcard_id === uploadImageFlashcard).length > 0 ?
                    <div className={styles.imageContainer}> 
                        <img src={images.filter((image) => image.flashcard_id === uploadImageFlashcard)[0].src} className={styles.image} /> 
                        <button className={styles.deleteImage} onClick={() => deleteImage(images.filter((image) => image.flashcard_id === uploadImageFlashcard)[0].flashcard_id)}>Usuń obrazek</button>
                    </div>
                :
                newImages.filter((image) => image.flashcardId === uploadImageFlashcard).length > 0 ?
                    <div className={styles.imageContainer}> 
                        <img src={newImages.filter((image) => image.flashcardId === uploadImageFlashcard)[0].src} className={styles.image} /> 
                        <button className={styles.deleteImage} onClick={() => deleteImage(newImages.filter((image) => image.flashcardId === uploadImageFlashcard)[0].flashcardId)}>Usuń obrazek</button>
                    </div>
                :
                    <UploadImage 
                        flashcardId={uploadImageFlashcard} 
                        closeModal={() => {
                            setUploadImageModal(false);
                            setUploadImageFlashcard(-1);
                        }}    
                        newFlashcard={newFlashcards.find((flashcard => flashcard.flashcard_id === uploadImageFlashcard)) ? true : false}
                        updateImage={updateImage}
                        insertImage={insertImage}
                    />
                }
            </Modal>
        </div>
    )
}

export default EditCourse;
