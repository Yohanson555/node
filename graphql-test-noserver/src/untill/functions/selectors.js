const Firebird = require('node-firebird');
const dbconfig = require('../dbconfig');

const selectList = async (query, data, providerFunc) => {
    return new Promise((resolve, reject) => {
        Firebird.attach(dbconfig, (er, db) => {
            if (er) throw new Error(er);
    
            db.query(query, data, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.map((row) => providerFunc(row))); 
                }
    
                db.detach();
            });
        });
    });
}; 

const selectItem = async (query, data = [], providerFunc) => {
    return new Promise((resolve, reject) => {
        Firebird.attach(dbconfig, (er, db) => {
            if (er) throw new Error(er);
    
            db.query(query, data, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result.length > 0) {
                        resolve(providerFunc(result[0]));
                    } else {
                        resolve (null);
                    }
                }
    
                db.detach();
            });
        });
    });
}

module.exports = {
    selectList,
    selectItem
};