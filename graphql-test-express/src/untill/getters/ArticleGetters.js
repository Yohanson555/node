const {
    selectList,
    selectItem
} = require('../functions/selectors');

const listQuery = 'SELECT FIRST ? * FROM ARTICLES';
const itemQuery = 'SELECT * FROM ARTICLES WHERE ID=?';

const getArticles = (l = 10) => {
    let limit = parseInt(l, 10);

    if (!limit || limit < 1 && limit > 50) limit = 10;

    return selectList(listQuery, [limit], renderData);
}

const getArticle = (id) => {
    if (!id || id < 0) return null;

    return selectItem(itemQuery, [id], renderData);
}

const renderData = (row) => {
    return {
        id: row.ID,
        departmentId: row.ID_DEPARTAMENT,
        courseId: row.ID_COURSES,
        name: row.NAME,
        number: row.ARTICLE_NUMBER,
        internalName: row.INTERNAL_NAME,
        isActive: row.IS_ACTIVE === 1,
    };
}


module.exports = {
    getArticles,
    getArticle
};