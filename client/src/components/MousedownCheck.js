import React, { useEffect } from 'react';

function MousedownCheck(props) {
    function chceckClicked(ev) {
        const element = document.querySelector('.' + props.className);
        if(!element.contains(ev.target)) {
            props.action();
            
            if(props.action2) {
                props.action2();
            }
        }
    }
    
    useEffect(() => {
        if(props.dependency) {
            document.addEventListener('mousedown', chceckClicked);
        }
        
        return () => {
            document.removeEventListener('mousedown', chceckClicked);
        }

    }, [props.field1, props.field2, props.dependency]);

    return props.children;
}

export default MousedownCheck;
