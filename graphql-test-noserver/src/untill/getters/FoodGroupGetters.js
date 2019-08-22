const {
    selectList,
    selectItem
} = require('../functions/selectors');

const listQuery = 'SELECT FIRST ? * FROM FOOD_GROUP';
const itemQuery = 'SELECT * FROM FOOD_GROUP WHERE ID=?';

const getFoodGroups = (l = 10) => {
    let limit = parseInt(l, 10);

    if (!limit || limit < 1 && limit > 50) limit = 10;

    return selectList(listQuery, [limit], renderData);
}

const getFoodGroup = (id) => {
    if (!id || id < 0) return null;

    return selectItem(itemQuery, [id], renderData);
}

const renderData = (row) => {
    return {
        id: row.ID,
        categoryId: row.ID_CATEGORY,
        name: row.NAME,
        groupVat: row.GROUP_VAT,
        groupVatSign: row.GROUP_VAT_SIGN,
        isActive: row.IS_ACTIVE === 1
    };
}

module.exports = {
    getFoodGroups,
    getFoodGroup
};