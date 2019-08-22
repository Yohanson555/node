const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLBoolean,
} = require('graphql/type');

const categoryType = new GraphQLObjectType({
    name: 'Category',
    description: 'Product category',
    fields: () => ({
        id: {
            type: GraphQLNonNull(GraphQLID),
            description: 'The id of the category.',
        },
        
        name: {
            type: GraphQLNonNull(GraphQLString),
            description: 'Name of the category',
        },

        isActive: {
            type: GraphQLBoolean,
            description: 'Shows is category was deleted or not',
        },
    }),
});

module.exports = categoryType;