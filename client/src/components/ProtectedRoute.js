import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PageNotFound from './PageNotFound/PageNotFound';

function ProtectedRoute({ component: Component, types, ...rest }) {     
    return (
        <Route {...rest} render = {
            props => {
                let logged = document.cookie.includes('token=');

                if(!logged) {
                    return <Redirect to="/" />;
                }
                else {
                    let i = 0;

                    for(let paramKey in props.match.params) {
                        if(types[i++] === 'number') {
                            if(isNaN(parseInt((props.match.params[paramKey]), 10))) {
                                return <PageNotFound />;
                            }
                        }
                        else if(types[i++] === 'string') {
                            if(!typeof props.match.params[paramKey] === 'string') {
                                return <PageNotFound />
                            }
                        }
                    }

                    return <Component {...props} />;
                }
            }
        }/>
    )
}

export default ProtectedRoute;
