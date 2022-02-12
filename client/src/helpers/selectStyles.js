const customStyles = {
    control: (provided, state) => ({
        ...provided,
        borderColor: 'rgb(176, 198, 238)',
        minHeight: '50px',
        fontColor: '#fff',
        border: '2px solid #B0C6EE',
        '&:hover': {
            border: state.isFocused ? '2px solid #B0C6EE' : '2px solid #B0C6EE'
        },
        height: '50px',
        boxShadow: state.isFocused ? null : null,
        paddingLeft: '10px',
        fontSize: '18px',
        fontFamily: 'Roboto',
        color: 'rgba(61, 68, 133, 0.7)',
        "@media (min-width: 320px) and (max-width: 900px)": {
            ...provided["@media (min-width: 320px) and (max-width: 900px)"],
            fontSize: '16px'
        },
    }),
    valueContainer: (provided, state) => ({
        ...provided,
        height: '50px',
        padding: '0 8px',
        color: 'rgba(61, 68, 133, 0.70)',
        display: 'flex',
        alignItems: 'center',
        grid: 'none'
    }),
    input: (provided, state) => ({
        ...provided,
        margin: '0px',
        height: '50px'      
    }),
    indicatorSeparator: state => ({
        display: 'none'
    }),
    indicatorsContainer: (provided, state) => ({
        ...provided,
        height: '50px'
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? 'rgba(176, 198, 238, 0.5)' : 'initial',
        color: '#000',
        paddingLeft: '20px'
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#040759'
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        "svg": {
          fill: "#040759"
        }
    }),
};

export default customStyles;