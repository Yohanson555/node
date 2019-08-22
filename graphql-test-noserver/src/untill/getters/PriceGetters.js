const {
    selectList,
} = require('../functions/selectors');

const query = `
SELECT
    ap.id as id, 
    pr.id as price_id,
    pr.name as name,
    ap.price as price,
    ap.vat as vat,
    ap.id_currency as currency_id,
    ap.is_active as is_active
FROM
    article_prices as ap,
    prices as pr
WHERE 
    ap.id_articles = ?
and ap.ID_PRICES = pr.id`;


const getArticlePrices = (id) => {
    if (!id || id <= 0) return null;

    return selectList(query, [id], renderData);
};


const renderData = (row) => {
    return {
        id: row.ID,
        name: row.NAME, 
        priceId: row.PRICE_ID,
        currencyId: row.CURRENCY_ID,
        value: row.PRICE,
        vat: row.VAT,
        isActive: row.IS_ACTIVE === 1
    };
}

module.exports = {
    getArticlePrices
};