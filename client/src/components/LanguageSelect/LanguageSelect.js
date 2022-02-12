import React from 'react';
import Select from 'react-select';
import selectStyles from '../../helpers/selectStyles';

function LanguageSelect(props) {
    const languages = ['albański', 'angielski', 'arabski', 'białoruski', 'bośniacki', 'bułgarski', 'chiński', 'chorwacki', 'czeski', 'duński', 'estoński', 'farerski', 'filipińsk', 'fiński', 'francuski', 'grecki', 'gruziński', 'hawajski', 'hebrajski', 'hindi', 'hiszpańsk', 'holenders', 'indonezyj', 'inny', 'irlandzki', 'islandzki', 'japoński', 'kannada', 'koreański', 'litewski', 'luksembur', 'macedońsk', 'malajski', 'malediwsk', 'maltański', 'mongolski', 'nawaho', 'nepalski', 'niemiecki', 'norweski', 'perski', 'polski', 'portugals', 'rosyjski', 'rumuński', 'serbski', 'sindhi', 'somalijsk', 'sundajski', 'syryjski', 'szwedzki', 'słowacki', 'słoweński', 'tajski', 'turecki', 'ukraiński', 'walijski', 'wietnamsk', 'węgierski', 'włoski', 'łaciński', 'łotewski'];

    return (
        <Select
            value={props.selectedLanguage}
            onChange={props.handleSelectedLanguage} 
            options={languages.map((language) => { return { value: language, label: language }})} noOptionsMessage={() => 'Brak opcji'}
            isSearchable={true}
            styles={selectStyles}
            placeholder={'Wybierz język'}
            className={props.className}
        />
    );
}

export default LanguageSelect;
