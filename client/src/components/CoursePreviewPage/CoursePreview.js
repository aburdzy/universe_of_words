import React, { useState, useEffect } from 'react';
import styles from './CoursePreview.module.css'
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Loader from '../Loader/Loader';
import PageNotFound from '../PageNotFound/PageNotFound';
import FlashcardPreview from '../FlashcardPreview/FlashcardPreview';
import * as api from '../../api';
import cogoToast from 'cogo-toast';
import Modal from '../Modal/Modal';

function CoursePreview() {
    const [flashcards, setFlashcards] = useState([]);
    const [isCourseFound, setIsCourseFound] = useState();
    
    const history = useHistory();
    const location = useLocation();
    
    const [loading, setLoading] = useState(true);
    const [permisson, setPermission] = useState({});

    const { courseId } = useParams();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [resetCourseModalVisible, setRestCourseModalVisible] = useState(false);

    const [images, setImages] = useState([]);

    useEffect(() => {
        api.getCourse(courseId, 0)
            .then((flashcardsResult) => {
                if (flashcardsResult.status === 'ok') {
                    setFlashcards(flashcardsResult.results);

                    let { owner_id, user_id } = flashcardsResult.permissions[0];
                    setPermission({ ownerId: owner_id, userId: user_id });

                    setIsCourseFound(true);

                    api.getImages(courseId)
                        .then((images) => {
                            setImages(images.results);
                            setLoading(false);
                        })
                        .catch((err) => cogoToast.error(err.message));
                }
                else {
                    setIsCourseFound(false);
                    setLoading(false);
                }
            })
            .catch((err) => { 
                setIsCourseFound(false);
                setLoading(false);

                cogoToast.error(err.message); 
            });
    }, []);

    function removeCourse() {
        // setDeleteModalVisible(false);

        api.deleteCourse(courseId)
            .then((res) => {
                if(res.status === 'ok') {
                    history.push('/kursy');
                    cogoToast.success('Kurs został usunięty');
                }
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function redirectToEditCourse() {
        api.checkUserAccess(courseId)
            .then(() => {
                history.push(location.pathname + '/edytuj')
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function resetFlashcardsCompleted() {
        api.resetFlashcardsCompleted(parseInt(courseId, 10))
            .then(() => {
                let tmpFlashcards = flashcards.map((flashcard) => {
                    return { ...flashcard, completed: 0}
                });

                setFlashcards(tmpFlashcards);
            })
            .catch((err) => cogoToast.error(err.message));
    }

    return (
        <div className="page">        
            <div className="container">
                {loading ? <Loader /> : !isCourseFound ? <PageNotFound /> : 
                    <div className={styles.container}>                    
                        <div className={styles.flashcardsAction}>
                            <button onClick={() => { history.push(location.pathname + '/ucz-sie') }}>Ucz się</button>
                            <button onClick={() => setRestCourseModalVisible(true)}>Resetuj postęp</button>                              
                        </div>
                        <div className={styles.flashcardsAction}>
                            <button disabled={permisson.userId !== permisson.ownerId ? true : false} className={permisson.userId !== permisson.ownerId ? styles.disabled : null} onClick={redirectToEditCourse}>Edytuj</button>  
                            <button disabled={permisson.userId !== permisson.ownerId ? true : false} className={permisson.userId !== permisson.ownerId ? styles.disabled : null} onClick={() => setDeleteModalVisible(true)}>Usuń</button> 
                        </div>
                        {flashcards.map((flashcard, index) => {
                            return (
                                <FlashcardPreview
                                    key={index}
                                    question={flashcard.question}
                                    answer={flashcard.answer} 
                                    modify={false}
                                    showCompleted={flashcard.completed}
                                    image={images.filter((image) => image.flashcard_id === flashcard.flashcard_id).length > 0 ? images.filter((image) => image.flashcard_id === flashcard.flashcard_id)[0].src : false}
                                    showImage={true}
                                />
                            );
                        })}  
                    </div>
                }
            </div>
            <Modal 
                isOpen={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                header="Czy na pewno chcesz usunąć kurs?"
                width={'300px'}
                confirm="Usuń"
                action={() => removeCourse()}
                cancel="Anuluj"
            >
            </Modal>
            <Modal 
                isOpen={resetCourseModalVisible}
                onClose={() => setRestCourseModalVisible(false)}
                header="Czy na pewno chcesz zresetować postęp kursu?"
                width={'300px'}
                confirm="Tak"
                action={() => resetFlashcardsCompleted()}
                cancel="Nie"
            >
            </Modal>
        </div>
    );
}

export default CoursePreview;