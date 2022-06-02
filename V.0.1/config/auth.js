const sql = require("./db");

// constructor
const Auth = function(data) {
    this.token = data.token;
};

Auth.token = (token) => {
    return new Promise((resolve,reject) => {
        sql.query(`SELECT * FROM token where token = ?`,[token], (error, result, fields) => {
            if (error) {
                throw error;
            }
            if (result.length > 0) {
                let d = result[0];
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