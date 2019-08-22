const {
    selectList,
    selectItem
} = require('../functions/selectors');

const listQuery = 'SELECT FIRST ? * FROM FUNC_PANEL_TABS';
const itemQuery = 'SELECT * FROM FUNC_PANEL_TABS WHERE ID=?';

const getTabs = (l = 10) => {
    let limit = parseInt(l, 10);

    if (!limit || limit < 1 && limit > 50) limit = 10;

    return selectList(listQuery, [limit], renderData);
}

const getTab = (id) => {
    if (!id || id < 0) return null;

    return selectItem(itemQuery, [id], renderData);
}

const renderData = (row) => {
    return {
        id: row.ID,
        name: row.NAME,
        num: row.NUM,
        ml_name: row.ML_NAME,
        state: row.IS_ACTIVE === 1 ? 1 : 0
    };
}

module.exports = {
    getTabs,
    getTab
};