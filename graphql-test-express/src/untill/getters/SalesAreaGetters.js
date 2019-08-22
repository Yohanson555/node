const {
    selectList,
    selectItem
} = require('../functions/selectors');

const listQuery = 'SELECT FIRST ? * FROM SALES_AREA';
const itemQuery = 'SELECT * FROM SALES_AREA WHERE ID = ?';

const articlesSAQuery = `
select
    sa.id as id,
    sa.NAME as name,
    sa.number as number,
    sa.bmanual as bmanuak,
    sa.close_manualy as close_manualy,
    sa.is_active as is_active
from
    sales_area as sa,
    article_available as aa
where aa.id_articles = ?
and aa.id_sales_area = sa.id`;

const getSalesAreas = (l = 10) => {
    let limit = parseInt(l, 10);

    if (!limit || limit < 1 && limit > 50) limit = 10;

    return selectList(listQuery, [limit], renderData);
}

const getSalesArea = (id) => {
    if (!id || id < 0) return null;

    return selectItem(itemQuery, [id], renderData);
}

const getArticleSalesAres = (id) => {
    if (!id || id < 0) return null;

    return selectList(articlesSAQuery, [id], renderData);
};

const renderData = (row) => {
    return {
        id: row.ID,
        name: row.NAME,
        number: row.NUMBER,
        bManual: row.BMANUAL === 1,
        closeManual: row.CLOSE_MANUALY === 1,
        isActive: row.IS_ACTIVE === 1
    };
}

module.exports = {
    getSalesAreas,
    getSalesArea,
    getArticleSalesAres
};