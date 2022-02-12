import cogoToast from 'cogo-toast';
import React, { useState } from 'react';
import * as styles from './Auth.module.css';
import * as api from '../../api';

function PasswordRemind() {
    const [mail, setMail] = useState('');

    function remindPassword() {
        if(mail === '') {
            cogoToast.error('Uzupełnij adres mailowy.');
        }

        api.remindPassword(mail)
            .then(() => cogoToast.success('Na podany adres mailowy zostało wysłane nowe hasło.'))
            .catch((err) => cogoToast.error(err.message));
    }

    return (
        <div className="page">
            <form className={styles.form} onClick={(ev) => ev.preventDefault()}>
                <h2>Przypomnienie hasła</h2>
                <input type="text" placeholder="Adres e-mail" value={mail} onChange={(ev) => setMail(ev.target.value)} />
                <button className={styles.submit} type="submit" onClick={remindPassword}>Wyślij mail</button>
            </form>
        </div>
    );
}

export default PasswordRemind;
