const sql = require("./db.pg");

// constructor
const Query = function(data) {
};

Query.exec = (select,table,query,value) => {
    return new Promise((resolve,reject) => {
        console.log(`SELECT ${select} FROM ${table} ${query} ${value}`);
        sql.query(`SELECT ${select} FROM ${table} ${query}`,value, (error, result) => {
            if (error) {
                throw error;
            }
            if (result.rowCount > 0) {
                let d = result.rows;
                resolve(d);
            } else {
                reject()
            }
        });
    
    });
};

module.exports = Query;