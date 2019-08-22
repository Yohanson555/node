const {
    selectList,
    selectItem
} = require('../functions/selectors');

const listQuery = 'SELECT FIRST ? * FROM CATEGORY';
const itemQuery = 'SELECT * FROM CATEGORY WHERE ID = ?';


const getCategories = (l = 10) => {
    let limit = parseInt(l, 10);

    if (!limit || limit < 1 && limit > 50) limit = 10;

    return selectList(listQuery, [limit], renderData);
}

const getCategory = (id) => {
    if (!id || id < 0) return null;

    return selectItem(itemQuery, [id], renderData);
}

const renderData = (row) => {
    return {
        id: row.ID,
        name: row.NAME,
        isActive: row.IS_ACTIVE === 1
    };
}


module.exports = {
    getCategory,
    getCategories
};