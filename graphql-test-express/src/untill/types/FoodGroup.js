const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean,
} = require('graphql/type');

const {
    getCategory
} = require('../getters/CategoryGetters');

const categoryType = require('./Category');

const foodGroupType = new GraphQLObjectType({
    name: 'FoodGroup',
    description: 'Product food group',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the food group.',
        },

        categoryId: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The category id of the food group.',
        },
        
        name: {
            type: GraphQLNonNull(GraphQLString),
            description: 'Name of the food group',
        },

        groupVat: {
            type: GraphQLInt,
            description: 'Group vat value',
        },

        groupVatSign: {
            type: GraphQLString,
            description: 'Group vat sign',
        },
        
        isActive: {
            type: GraphQLBoolean,
            description: 'Shows is food group was deleted or not',
        },

        category: {
            type: categoryType,
            description: 'Food group category details',
            resolve: ({ categoryId }) => getCategory(categoryId)
        },

        
    }),
});

module.exports = foodGroupType;