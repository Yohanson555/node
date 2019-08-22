const {
    selectList,
    selectItem
} = require('../functions/selectors');

const listQuery = 'SELECT FIRST ? * FROM CURRENCY';
const itemQuery = 'SELECT * FROM CURRENCY WHERE ID = ?';

const getCurrencies = (l = 10) => {
    let limit = parseInt(l, 10);

    if (!limit || limit < 1 && limit > 50) limit = 10;

    return selectList(listQuery, [limit], renderData);
}

const getCurrency = (id) => {
    if (!id || id < 0) return null;

    return selectItem(itemQuery, [id], renderData);
}

const renderData = (row) => {
    return {
        id: row.ID,
        name: row.NAME,
        code: row.CODE,
        round: row.ROUND,
        roundDown: row.ROUND_DOWN,
        rate: row.RATE,
        symbol: row.SYMBOL,
        alignment: row.SYM_ALYGMENT,
        isActive: row.IS_ACTIVE === 1,
    };
}

module.exports = {
    getCurrencies,
    getCurrency
};