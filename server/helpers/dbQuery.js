const db = require('../configs/db');

function dbQuery(query, values = []) {
    return new Promise((resolve, reject) => {
        db.query(query, values, (error, results) => {
            if(!error) {
                resolve(results);
            }
            else {
                reject(error);
            } 
        });
    });
}

module.exports = dbQuery;