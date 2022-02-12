module.exports.validateBody = function(validate) {
    return (req, res, next) => {
        let valid = validate(req.body);

        if(valid) {
            next();
        }
        else {
            res.json({ status: 'error', error: 'INVALID_REQUEST' });
        }
    };
};

module.exports.validateParams = function(validate) {
    return (req, res, next) => {
        let valid = validate(req.params);

        if(valid) {
            next();
        }
        else {
            res.json({ status: 'error', error: 'INVALID_REQUEST' });
        }
    };
};