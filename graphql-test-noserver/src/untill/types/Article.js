const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean,
    gRP
} = require('graphql/type');

const {
    getDepartment
} = require('../getters/DepartmentGetters');

const {
    getCourse
} = require('../getters/CourseGetters');

const {
    getArticlePrices
} = require('../getters/PriceGetters');

const {
    getArticleSalesAres
} = require('../getters/SalesAreaGetters');

const departmentType = require('./Department');
const courseType = require('./Course');
const priceType = require('./Price');
const salesAreaType = require('./SalesArea');

const articleType = new GraphQLObjectType({
    name: 'Article',
    description: 'Product article type',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the article.',
        },

        departmentId: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the article department.',
        },

        courseId: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the article course.',
        },

        name: {
            type: GraphQLNonNull(GraphQLString),
            description: 'Name of the article',
        },

        internalName: {
            type: GraphQLNonNull(GraphQLString),
            description: 'Internal name of the article',
        },

        number: {
            type: GraphQLInt,
            description: 'Article order variable',
        },
        
        department: {
            type: GraphQLNonNull(departmentType),
            description: 'Article department details',
            resolve: ({ departmentId }) => getDepartment(departmentId),
        },

        course: {
            type: GraphQLNonNull(courseType),
            description: 'Article course details',
            resolve: ({ courseId }) => getCourse(courseId),
        },
        
        prices: {  //TODO
            type: GraphQLList(priceType),
            description: 'List of prices of an article',
            resolve: ({id}) => getArticlePrices(id),
        },

        salesAreas: {
            type: GraphQLList(salesAreaType),
            description: 'Sales areas list that article depends on',
            resolve: ({id}) => getArticleSalesAres(id)
        },

        isActive: {
            type: GraphQLBoolean,
            description: 'Shows is article deleted or not',
        },
    }),
});

module.exports = articleType;