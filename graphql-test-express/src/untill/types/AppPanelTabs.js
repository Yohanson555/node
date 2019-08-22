const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean,
} = require('graphql/type');

const {
    getFoodGroup
} = require('../getters/FoodGroupGetters');

const foodGroupType = require('./FoodGroup');

const departmentType = new GraphQLObjectType({
    name: 'Department',
    description: 'Product department',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the department.',
        },
        
        foodgroupId: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the department food group.',
        },
        
        number: {
            type: GraphQLInt,
            description: 'Department order variable',
        },
        
        name: {
            type: GraphQLNonNull(GraphQLString),
            description: 'Name of the article',
        },

        isActive: {
            type: GraphQLBoolean,
            description: 'Shows is article deleted or not',
        },

        foodGroup: {
            type: GraphQLNonNull(foodGroupType),
            description: 'Article department details',
            resolve: ({foodgroupId}) => getFoodGroup(foodgroupId),
        },
    }),
});

module.exports = departmentType;