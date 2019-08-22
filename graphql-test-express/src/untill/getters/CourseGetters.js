const {
    selectList,
    selectItem
} = require('../functions/selectors');

const listQuery = 'SELECT FIRST ? * FROM COURSES';
const itemQuery = 'SELECT * FROM COURSES WHERE ID = ?';

const getCourses = (l = 10) => {
    let limit = parseInt(l, 10);

    if (!limit || limit < 1 && limit > 50) limit = 10;

    return selectList(listQuery, [limit], renderData);
}

const getCourse = (id) => {
    if (!id || id < 0) return null;

    return selectItem(itemQuery, [id], renderData);
}

const renderData = (row) => {
    return {
        id: row.ID,
        name: row.NAME,
        number: row.COURSENUMBER,
        isActive: row.IS_ACTIVE === 1
    };
}

module.exports = {
    getCourses,
    getCourse
};