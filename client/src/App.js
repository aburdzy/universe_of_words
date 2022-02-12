import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { UserContext } from './contexts/UserContext';
import SocketContext, { context as initialSocketContext } from './contexts/SocketContext';
import './App.css';

import Header from './components/Header/Header';
import HomePage from './components/HomePage/HomePage';
import Login from './components/AuthPages/LoginPage';
import Register from './components/AuthPages/RegisterPage';
import Courses from './components/CoursesPage/Courses/Courses';
import CoursePreview from './components/CoursePreviewPage/CoursePreview';
import FlashcardsLearn from './components/FlashcardsLearnPage/FlashcardLearn/FlashcardsLearn';
import ProtectedRoute from './components/ProtectedRoute';
import FinishedLearning from './components/FinishedLearningPage/FinishedLearning';
import NewCourse from './components/NewCoursePage/NewCourse';
import PageNotFound from './components/PageNotFound/PageNotFound';
import EditCourse from './components/EditCoursePage/EditCourse';
import Lobby from './components/LobbyPage/Lobby/Lobby';
import Room from './components/RoomPage/Room/Room';
import Profile from './components/ProfilePage/Profile';
import PasswordRemind from './components/AuthPages/PasswordRemind';
import ManageUsers from './components/ManageUsers/ManageUsers';

function App() {
    const [user, setUser] = useState({ id: -1, username: '', logged: 0, roomId: -1, banned: -1 });
    const [socket, setSocket] = useState(initialSocketContext);
    initialSocketContext.setSocket = setSocket;

    return (
        <div className="App">
            <UserContext.Provider value={[user, setUser]}>
                <SocketContext.Provider value={{socket, setSocket}}>
                    <Router>
                        <Route>
                            <Header />
                        </Route>
                        <Switch>
                            <Route exact path="/" component={HomePage} />
                            <Route exact path="/logowanie" component={Login} />
                            <Route exact path="/rejestracja" component={Register} /> 
                            <Route exact path="/przypomnienie-hasla" component={PasswordRemind} /> 
                            <ProtectedRoute exact path="/kursy" component={Courses} />
                            <ProtectedRoute exact path="/kursy/dodaj-kurs" component={NewCourse} />
                            <ProtectedRoute exact path="/kursy/:courseId" types={['number']} component={CoursePreview} />
                            <ProtectedRoute exact path="/kursy/:courseId/edytuj" types={['number']} component={EditCourse} />
                            <ProtectedRoute exact path="/kursy/:courseId/ucz-sie" types={['number']} component={FlashcardsLearn} />
                            <ProtectedRoute exact path="/kursy/:courseId/ukonczono" types={['number']} component={FinishedLearning} />
                            <ProtectedRoute exact path="/poczekalnia" component={Lobby} />
                            <ProtectedRoute exact path="/profil" component={Profile} />
                            <ProtectedRoute exact path="/zarzadzaj-uzytkownikami" component={ManageUsers} />
                            <ProtectedRoute exact path="/:roomId" types={['string']} component={Room} />
                            <Route component={PageNotFound} />
                        </Switch>
                    </Router>
                </SocketContext.Provider>
            </UserContext.Provider>
        </div>
    );
}

export default App;
