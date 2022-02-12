import cogoToast from 'cogo-toast';
import React, { useState, useRef } from 'react';
import * as styles from './UploadImage.module.css';
import * as api from '../../api';

function UploadImage(props) {
    const [image, setImage] = useState(null);
    let labelRef = useRef(null);

    function uploadImage() {
        if(!image) {
            cogoToast.error('Brak załączonego obrazka.');
            return;
        }

        props.closeModal();

        api.uploadImage(image)
            .then((res) => {
                props.updateImage(res.image.imageUrl, parseInt(res.image.flashcardId, 10));
                cogoToast.success('Obrazek został zapisany.');
            })
            .catch((err) => cogoToast.error(err.message));
    }

    function newCourseUploadImage() {
        if(!image) {
            cogoToast.error('Brak załączonego obrazka.');
            return;
        }

        props.closeModal();

        props.insertImage(URL.createObjectURL(image.get('image')), props.flashcardId, image);
    }

    function getFileInfo(ev) {
        if(ev.target.files[0]) {
            const formData = new FormData();
            formData.append('image', ev.target.files[0], ev.target.files[0].name);
            
            formData.set('flashcardId', props.flashcardId);
    
            if(ev.target.files[0].size > 2097152) {
                cogoToast.error('Maksymalny rozmiar obrazka to 2MB.');
                formData.delete('image');
                return;
            }
            
            labelRef.current.innerHTML = ev.target.files[0].name;
            setImage(formData);
        }    
    }

    return (
        <div className={styles.container}>
           <div className={styles.imageUpload}>
                <input id="file" type="file" accept=".png, .jpg, .jpeg" className={styles.file} onChange={getFileInfo} />
                {image ? 
                    <div className={styles.imageContainer}>
                        <img src={URL.createObjectURL(image.get('image'))} className={styles.image} /> 
                    </div>
                : null}
                <label htmlFor="file" ref={labelRef}>Wybierz obrazek</label>
            </div>
            {props.newFlashcard ? <button className={styles.upload} onClick={newCourseUploadImage}>Zapisz</button> : <button className={styles.upload} onClick={uploadImage}>Zapisz</button>}
        </div>
    );
}

export default UploadImage;
