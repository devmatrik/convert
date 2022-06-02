const {sm} = require("./db.pg");

// constructor
const Auth = function(data) {
    this.token = data.token;
};

Auth.token = (token) => {
    return new Promise((resolve,reject) => {
        
        sm.query(`SELECT * FROM token where token = $1`,[token], (error, result, fields) => {
            if (error) {
                throw error;
            }
            if (result.rowCount > 0) {
                let d = result.rows[0];
                resolve({
                    'token' : d.token,
                    'method' : d.method
                });

            } else {
                reject()
            }
        });
    
    });
};

module.exports = Auth;