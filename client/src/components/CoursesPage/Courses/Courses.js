import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import * as styles from'./Courses.module.css';
import Course from '../Course/Course';
import Loader from '../../Loader/Loader';
import * as api from '../../../api';
import PageNotFound from '../../PageNotFound/PageNotFound';
import cogoToast from 'cogo-toast';
import Togglers from '../../Togglers/Togglers';
import LanguageSelect from '../../LanguageSelect/LanguageSelect';
import { UserContext } from '../../../contexts/UserContext';

function Courses() {
    const [courses, setCourses] = useState([]);
    const [foundCourses, setFoundCourses] = useState([]);
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [isCoursesFound, setIsCoursesFound] = useState();
    const [isSearching, setIsSearching] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState({ value: 'angielski', label: 'angielski' });
    const [user] = useContext(UserContext);

    function getFilterCourses(type, language) {
        if(user.id === 1) {
            if(type === 1) {
                type = 2;
            }
        }

        setLoading(true);

        api.getCourses(type, language)
            .then((res) => {
                if(res.status === 'ok') {            
                    setCourses(res.results);
                    setLoading(false);
                    setIsCoursesFound(true); 
                }    
                else {
                    setIsCoursesFound(false);
                    setLoading(false);
                }
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function searchCourse(ev) {
        let searchingValue = ev.target.value;

        if(searchingValue === '') {
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        let tmpCourses = [...courses];
        let searchedCourses = tmpCourses.filter(( course ) => {
            return course.name.includes(searchingValue);
        });

        setFoundCourses(searchedCourses);
    }

    function handleSelectedLanguage(selectedLanguage) {
        setSelectedLanguage(selectedLanguage);
    }

    function displayCourses(courses) {
        return (
            <div className={styles.coursesCountainer}>
                {courses.length === 0 ? <h2 className={styles.lackOfCourses}>Brak kursów</h2> : 
                    courses.map((course, index) => {
                        return (
                            <Course 
                                key={index} 
                                name={course.name} 
                                flashcardAmount={course.amount} 
                                completed={course.completed} 
                                courseId={course.course_id} 
                                public={course.public_access} 
                                completedFlashcards={course.completed_flashcards}
                                uncompletedFlashcards={course.uncompleted_flashcards}
                            />
                        )
                    })
                }
            </div>
        );
    }

    function administratorPage() {
        return (
            <React.Fragment>
            <button className={styles.manageUsers} onClick={() => history.push('/zarzadzaj-uzytkownikami')}>Zarządzaj użytkownikami</button>
            <Togglers 
                action={getFilterCourses}
                className='filter'
                options={['Podstawowe', 'Innych']}
                dependency={selectedLanguage}
            />
            
            <div className={styles.container}>
            <input type="text" className={styles.searchCourse} placeholder="Szukaj kursu" onChange={(ev) => searchCourse(ev)}/>
            <LanguageSelect 
                selectedLanguage={selectedLanguage}
                className={styles.select}
                handleSelectedLanguage={handleSelectedLanguage}
            />
        </div>
        {loading ? <Loader wrapper={true} /> : !isCoursesFound ? <PageNotFound /> : isSearching ? displayCourses(foundCourses) : displayCourses(courses)}
        </React.Fragment>
        );
    }

    function userPage() {
        return (
            <React.Fragment>
                <Togglers 
                    action={getFilterCourses}
                    className='filter'
                    options={['Podstawowe', 'Moje', 'Innych']}
                    dependency={selectedLanguage}
                />
               <div className={styles.container}>
                    <input type="text" className={styles.searchCourse} placeholder="Szukaj kursu" onChange={(ev) => searchCourse(ev)}/>
                    <LanguageSelect 
                        selectedLanguage={selectedLanguage}
                        className={styles.select}
                        handleSelectedLanguage={handleSelectedLanguage}
                    />
                </div>
                {loading ? <Loader wrapper={true} /> : !isCoursesFound ? <PageNotFound /> : isSearching ? displayCourses(foundCourses) : displayCourses(courses)}
            </React.Fragment>
        );
    }

    return (
        <div className="page">
            <div className="container">
                {user.banned !== -1 ?
                    <div className={styles.actionButtonContainer}>
                        <button onClick={() => history.push('/poczekalnia')}>Rywalizuj</button>
                        <button onClick={() => history.push('/kursy/dodaj-kurs')} disabled={user.banned} className={user.banned ? styles.disabled : 'null'}>Dodaj kurs</button>
                    </div> 
                : null}
                {user.logged && user.id === 1 ? administratorPage() : user.logged ? userPage(): null}
            </div>
        </div>
    );
};

export default Courses;