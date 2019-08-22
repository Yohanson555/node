const {
    selectList,
    selectItem
} = require('../functions/selectors');

const listQuery = 'SELECT FIRST ? * FROM DEPARTMENT';
const itemQuery = 'SELECT * FROM DEPARTMENT WHERE ID=?';

const getDepartments = (l = 10) => {
    let limit = parseInt(l, 10);

    if (!limit || limit < 1 && limit > 50) limit = 10;

    return selectList(listQuery, [limit], renderData);
}

const getDepartment = (id) => {
    if (!id || id < 0) return null;

    return selectItem(itemQuery, [id], renderData);
}

const renderData = (row) => {
    return {
        id: row.ID,
        name: row.NAME,
        number: row.DEP_NUMBER,
        foodgroupId: row.ID_FOOD_GROUP,
        isActive: row.IS_ACTIVE === 1,
    };
}

module.exports = {
    getDepartments,
    getDepartment
};